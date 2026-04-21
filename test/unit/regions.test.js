const { createRegion } = require('../../percy/util/regions');

describe('createRegion', () => {
  it('builds a coordinate-based ignore region by default', () => {
    const r = createRegion({ top: 10, right: 20, bottom: 30, left: 40 });
    expect(r.algorithm).toBe('ignore');
    expect(r.coOrdinates).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
  });

  it('fills missing coordinate sides with 0', () => {
    const r = createRegion({ top: 5 });
    expect(r.coOrdinates).toEqual({ top: 5, right: 0, bottom: 0, left: 0 });
  });

  it('supports XPath-based selectors', () => {
    const r = createRegion({ elementXpath: '//div[@id="banner"]', algorithm: 'layout' });
    expect(r.elementXpath).toBe('//div[@id="banner"]');
    expect(r.coOrdinates).toBeUndefined();
    expect(r.algorithm).toBe('layout');
  });

  it('supports CSS-based selectors', () => {
    const r = createRegion({ elementCSS: '#ad', padding: 5 });
    expect(r.elementCSS).toBe('#ad');
    expect(r.padding).toBe(5);
  });

  it('throws when neither coordinates nor selectors are given', () => {
    expect(() => createRegion({})).toThrowError(/requires one of/);
  });

  it('includes configuration and assertion only when non-empty', () => {
    const bare = createRegion({ top: 1 });
    expect(bare.configuration).toBeUndefined();
    expect(bare.assertion).toBeUndefined();

    const withExtras = createRegion({ top: 1, configuration: { diffSensitivity: 1 }, assertion: { diffRatio: 0.1 } });
    expect(withExtras.configuration).toEqual({ diffSensitivity: 1 });
    expect(withExtras.assertion).toEqual({ diffRatio: 0.1 });
  });
});
