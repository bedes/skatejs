import afterMutations from '../../lib/after-mutations';
import fixture from '../../lib/fixture';
import { Component, define, h, prop, props, vdom } from '../../../src/index';

describe('vdom/properties', () => {
  it('class -> className', done => {
    const elem = new (define('x-test', {
      render() {
        vdom.element('div', { class: 'test' });
      },
    }));
    fixture(elem);
    afterMutations(
      () => expect(elem[symbols.shadowRoot].firstChild.className).to.equal('test'),
      done
    );
  });

  it('applies custom semantics to the className attribute when used in a stack context', done => {
    const helper = (_, children) => children();

    const elem = new (define('x-test', {
      render() {
        vdom.elementOpen(helper);
        vdom.elementOpen('div', null, null, 'className', 'inner');
        vdom.elementClose('div');
        vdom.elementClose(helper);
      },
    }));

    fixture(elem);

    afterMutations(
      () => expect(elem[symbols.shadowRoot].firstChild.getAttribute('class')).to.equal('inner'),
      done
    );
  });

  it('false should remove the attribute', done => {
    const elem = new (define('x-test', {
      render() {
        vdom.element('div', { test: false });
      },
    }));
    fixture(elem);
    afterMutations(
      () => expect(elem[symbols.shadowRoot].firstChild.hasAttribute('test')).to.equal(false),
      done
    );
  });

  it('should not set properties on SVG elements', done => {
    expect(() => {
      const Test = define('x-test', {
        render() {
          vdom.element('svg', { width: 100 });
        },
      });
      fixture(new Test());
      afterMutations(done);
    }).to.not.throw(Error);
  });

  describe('re-rendering', () => {
    let Elem1;
    let Elem2;

    beforeEach(() => {
      Elem1 = define('x-test', {
        props: {
          open: prop.boolean(),
        },
        render(elem) {
          vdom.element(Elem2, { open: elem.open });
        },
      });
      Elem2 = define('x-test', {
        props: {
          open: prop.boolean(),
        },
        render(elem) {
          vdom.text(elem.open ? 'open' : 'closed');
        },
      });
    });

    function text(elem) {
      return elem[symbols.shadowRoot].firstChild[symbols.shadowRoot].textContent;
    }

    it('boolean: false -> true -> false', done => {
      const elem = new Elem1();
      fixture(elem);
      afterMutations(
        () => expect(text(elem)).to.equal('closed', 'init'),
        () => props(elem, { open: true }),
        () => expect(text(elem)).to.equal('open', 'false -> true'),
        () => props(elem, { open: false }),
        () => expect(text(elem)).to.equal('closed', 'true -> false'),
        done
      );
    });
  });

  it('#876 - Apply prop attributes as properties in a polyfill environment', (done) => {
    const Elem1 = define('x-test', {
      render (elem) {
        return h(Elem2, { fooBar: true });
      }
    });
    const Elem2 = define('x-test', {
      props: {
        fooBar: {}
      },
      render(elem) {
        expect(elem.fooBar).to.be.equal(true);
        done();
      }
    });
    const elem = new Elem1();
    fixture(elem);
  });
});
