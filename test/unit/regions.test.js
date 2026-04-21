const { createRegion } = require('../../percy/util/regions');

describe('createRegion', () => {
  it('defaults algorithm to "ignore" and produces an elementSelector-shaped region', () => {
    const r = createRegion({ boundingBox: { top: 0, left: 0, width: 100, height: 80 } });
    expect(r.algorithm).toBe('ignore');
    expect(r.elementSelector).toEqual({ boundingBox: { top: 0, left: 0, width: 100, height: 80 } });
  });

  it('supports XPath selectors', () => {
    const r = createRegion({ elementXpath: '//div[@id="banner"]', algorithm: 'layout' });
    expect(r.elementSelector).toEqual({ elementXpath: '//div[@id="banner"]' });
    expect(r.algorithm).toBe('layout');
  });

  it('supports CSS selectors and padding', () => {
    const r = createRegion({ elementCSS: '#ad', padding: 5 });
    expect(r.elementSelector).toEqual({ elementCSS: '#ad' });
    expect(r.padding).toBe(5);
  });

  it('omits configuration when algorithm is not standard/intelliignore', () => {
    const r = createRegion({
      elementCSS: '#ad',
      algorithm: 'ignore',
      diffSensitivity: 0.5,
      carouselsEnabled: true
    });
    expect(r.configuration).toBeUndefined();
  });

  it('includes configuration for intelliignore', () => {
    const r = createRegion({
      elementCSS: '#ad',
      algorithm: 'intelliignore',
      diffSensitivity: 0.5,
      imageIgnoreThreshold: 0.1,
      carouselsEnabled: true,
      bannersEnabled: true,
      adsEnabled: true
    });
    expect(r.configuration).toEqual({
      diffSensitivity: 0.5,
      imageIgnoreThreshold: 0.1,
      carouselsEnabled: true,
      bannersEnabled: true,
      adsEnabled: true
    });
  });

  it('includes assertion block when diffIgnoreThreshold is set', () => {
    const r = createRegion({ elementCSS: '#ad', diffIgnoreThreshold: 0.1 });
    expect(r.assertion).toEqual({ diffIgnoreThreshold: 0.1 });
  });

  it('omits assertion block when no assertion fields are set', () => {
    const r = createRegion({ elementCSS: '#ad' });
    expect(r.assertion).toBeUndefined();
  });

  it('returns an empty elementSelector when nothing is passed', () => {
    const r = createRegion({});
    expect(r.algorithm).toBe('ignore');
    expect(r.elementSelector).toEqual({});
  });
});
