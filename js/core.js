/*jshint browser: true, bitwise: true, curly: true, eqeqeq: true, immed: true, indent: 4, latedef: true, newcap: true, noarg: true, quotmark: single, undef: true, unused: true, strict: false, trailing: true */
/*jslint nomen: true, plusplus: true, regexp: true */
/*globals window, document, $, _, yepnope, Modernizr, myko, CQ_Analytics */

(function () {
    var cashier = {//money that is in the vending machine
            500: 5,
            100: 5,
            50: 5,
            25: 100
        },
        user = {
            cash: 0,
            selection: '',
            item: {}
        },
        products = {
            'A': [],
            'B': [],
            'C': [],
            'D': [],
            'E': []
        },
        prices = [200, 275, 400, 375, 600, 825, 450, 675, 850, 225],
        machine = $('#vending-machine'),
        selection = '',
        output = machine.find('#display'),
        tray = machine.find('#tray'),
        timer = null,
        max_products = 5;

    //function that renders to the display
    function display(message, clear) {
        if (_.isObject(message)) {
            output.html(_.template($('#display-tmplt').html())({user: message}));
        } else {
            output.html(message);
        }
        if (clear) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            timer = setTimeout(function () { display(user); }, 3000);
        }
    }
    //renders the products to screen
    function renderProducts() {
        var list = machine.find('#products'),
            tpl = _.template($('#product-tmplt').html());
        list.html(tpl({products: products}));

    }
    //renders the change
    function renderChange(coins) {
        var coin,
            el,
            i;
        tray.html('');
        for (coin in coins) {
            for (i = 0; i < coins[coin]; i++) {
                el = $('<div class="coin-' + coin + '"></div>');
                tray.append(el);
            }
        }
    }

    //function that creates a list of products with random prices from the prices array
    function generateProducts() {
        var key, i;
        for (key in products) {
            for (i = 0; i < 6; i++) {
                products[key].push({'price': prices[Math.floor((Math.random() * 10))], 'quantity': max_products});
            }
        }
    }

    //sort the coins that were put into the machine and calculates the total
    function sortCoins(coins) {
        var coin;
        for (coin in coins) {
            user.cash += coin * coins[coin];
            cashier[coin] += coins[coin];
        }
        return user.cash;
    }
    //gives change to the user
    function giveChange() {
        var coin,
            keys = Object.keys(cashier).reverse(),
            coins = {},
            counter = 0;
        for (coin in keys) {
            counter = 0;
            while (user.cash - keys[coin] >= 0 && cashier[keys[coin]] - counter > 0) {
                user.cash -= keys[coin];
                counter++;

            }
            cashier[keys[coin]] -= counter;
            coins[keys[coin]] = counter;
        }
        return coins;
    }

    //checks availability of the product and if the customer has enough money for it
    function getProduct(x, y) {
        if (!products[x][y]) {
            user.selection = '';
            display('Product not available!!!', true);
            return false;
        }
        if (products[x][y].quantity > 0) {
            if (products[x][y].price <= user.cash) {
                user.cash -= products[x][y].price;
                user.item = products[x][y];
                products[x][y].quantity--;
                display(user);
                renderProducts();
                renderChange(giveChange());
                user.item = {};
            } else {
                user.selection = '';
                display('No money no problems!!', true);
            }
        } else {
            user.selection = '';
            display('Product not available!!!', true);

        }
    }

    //attches events to the buttons
    function attachEvents() {

        $('[class^="coin-"]').on('click', function (e) {
            var key = [];
            e.preventDefault();
            key[$(this).data('value')] = 1;
            sortCoins(key);
            display(user);
        });

        machine.find('.btn').on('click', function (e) {
            var patt;
            e.preventDefault();
            selection += $(this).text();
            user.selection = selection;
            display(user);
            if (selection.length === 2) {
                patt = new RegExp(/[A-E]\d/);
                if (patt.test(selection)) {
                    getProduct(selection[0], selection[1]);
                } else {
                    display("Invalid Code...", true);
                    user.selection = '';
                }
                selection = '';
            }
        });

    }

    generateProducts();
    renderProducts();
    attachEvents();

}());