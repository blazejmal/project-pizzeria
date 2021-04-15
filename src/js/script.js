/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initAmountWidget();
      thisProduct.initOrderForm();
      thisProduct.processOrder();

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

    getElements() {
      const thisProduct = this;
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      // console.log('thisProduct.accordionTrigger', thisProduct.accordionTrigger);
      // console.log('div obrazków', thisProduct.imageWrapper);
      // console.log('thisProduct widget', thisProduct.amountWidgetElem);
    }
    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking)
     const clickableTrigger = select.menuProduct.clickable;

     console.log('clickableTrigger', clickableTrigger);

     console.log('thisProduct.element', this); */

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */

        const activeElements = document.querySelectorAll(classNames.menuProduct.wrapperActive);
        for (let activeElement of activeElements) {
          activeElement.classList.remove('active');
        }
        /* if there is active product and it's not thisProduct.element, remove class active from it */

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });
    }
    initOrderForm() {
      const thisProduct = this;
      //  console.log('initOrderForm', this.initOrderForm);
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //  console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //  console.log(paramId, param);
        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //  console.log(optionId, option);
          // check if there is param with a name of paramId in formData and if it includes optionId
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            // check if the option is not default
            if (!option.default) {
              // add option price to price variable
              price += option.price;
            }
          } else {
            // check if the option is default
            if (option.default) {
              // reduce price variable
              price -= option.price;
            }
          }
          const optionImage = thisProduct.imageWrapper.querySelector('toppings-salami');
          if (optionImage) {

            // Yes! We've found it!
          }
          //    console.log('optionImage', optionImage);
          // console.log('paramId', paramId);
          //console.log('optionId', optionId);
        }




        // multiply price by amount
        price *= thisProduct.amountWidget.value;

        //thisProduct.amountWidget.value = thisProduct.input;






        // update calculated price in the HTML
        thisProduct.priceSingle = String(price);
        thisProduct.priceElem.innerHTML = String(price);
        //  console.log('CO TO KURWA JEST', thisProduct.priceSingle);
      }
    }
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
        //   console.log('działa?');
      });
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }

    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productsSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.data.price,
        price: thisProduct.priceSingle,
        params: [this.prepareCartProductParams()],
      };
      // console.log('productsSummary', productsSummary);
      return productsSummary;
    }
    //  thisProduct.priceSingle, zamieniłem je miejscami !!!!!!!!!!!!!!!!!!
    //thisProduct.data.price, !!!!!!!!!!!!!!!!!!!!!!!!





    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      // for very category (param)
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          name: param.label,
          options: {},
        };

        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            console.log(option);
            // option is selected!
          }
        }
      }

      return params;
    }





  }


  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      //   console.log('AmountWidget', thisWidget);
      // console.log('constructor arguments', element);
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;


      const newValue = parseInt(value);

      if (isNaN(newValue)) {
        thisWidget.value = 1;
        thisWidget.input.value = thisWidget.value;
        return;
      }

      if (value < settings.amountWidget.defaultMin) {
        thisWidget.value = settings.amountWidget.defaultMin;
        thisWidget.input.value = thisWidget.value;
        return;
      }

      if (value > settings.amountWidget.defaultMax) {
        thisWidget.value = settings.amountWidget.defaultMax;
        thisWidget.input.value = thisWidget.value;
        return;
      }

      if (thisWidget.value !== newValue) {
        thisWidget.value = newValue;
        thisWidget.input.value = thisWidget.value;
      }
      thisWidget.announce();
    }

    initActions() {
      this.input.addEventListener('change', () => {
        this.setValue(this.input.value);
      });
      this.linkDecrease.addEventListener('click', () => {
        const decreasedWidgetValue = parseInt(this.input.value) - 1;
        this.setValue(decreasedWidgetValue);
      });
      this.linkIncrease.addEventListener('click', () => {
        const increasedWidgetValue = parseInt(this.input.value) + 1;
        this.setValue(increasedWidgetValue);
      });
    }
    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];


      thisCart.getElements(element);
      thisCart.initActions();


      console.log('thisCart', thisCart);
    }


    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    }


    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', () => {
        thisCart.dom.wrapper.classList.toggle('active');
      });
    }

    add(menuProduct) {
      // const thisCart = this;

      console.log('adding product', menuProduct);
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
    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      // console.log('*** App starting ***');
      //  console.log('thisApp:', thisApp);
      //  console.log('classNames:', classNames);
      //  console.log('settings:', settings);
      //  console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

  };





  app.init();
}
