/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.initAccordion();

      console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      /*  Generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* Create element using utilis.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /*  Find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* Add element to menu  */
      menuContainer.appendChild(thisProduct.element);
    }
    initAccordion() {
      const thisProduct = this.element;

      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = select.menuProduct.clickable;
      console.log('clickableTrigger', clickableTrigger);

      console.log('thisProduct.element', this);


      /* START: add event listener to clickable trigger on event click */
      thisProduct.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */

        const activeElements = document.querySelectorAll(classNames.menuProduct.wrapperActive);
        for (let activeElement of activeElements) {
          activeElement.classList.remove('active');
        }

        /* if there is active product and it's not thisProduct.element, remove class active from it */

        /* toggle active class on thisProduct.element */
        thisProduct.classList.toggle('active');
      });

    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;

      console.log('thisApp.data', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();


      thisApp.initMenu();
    },
  };





  app.init();

}
