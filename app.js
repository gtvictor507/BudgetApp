// ************** BudgetController module
var budgetController = (function () {

   // Expense function constructor
   var Expense = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
   };


   // method for calculating the percentage for the expenses
   Expense.prototype.calcPercentage = function (totalIncome) {

      if (totalIncome > 0) {
         this.percentage = Math.round((this.value / totalIncome) * 100);

      } else {
         this.percentage = -1;
      }
   };


   Expense.prototype.getPercentage = function () {
      return this.percentage;
   };



   // Income Function constructor
   var Income = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
   };

   // function for calculating the total
   var calculateTotal = function (type) {
      var sum = 0;
      data.allItems[type].forEach(function (cur) {
         sum += cur.value;
      });

      data.totals[type] = sum;
   };

   // data storage structure using objects

   var data = {
      allItems: {
         exp: [],
         inc: []
      },
      totals: {
         exp: 0,
         inc: 0
      },
      budget: 0,
      percentage: -1
   };

   // returning using the public methods
   return {
      addItem: function (type, des, val) {
         var newItem, ID;

         // create new ID
         if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

         } else {
            ID = 0;
         }

         // Add new item based on the type 'inc' or 'exp'
         if (type === 'exp') {
            newItem = new Expense(ID, des, val);
         } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
         }

         // square brackets help us to select the array from the allItems object where we want to astore our data
         // push the new item to our data structure
         data.allItems[type].push(newItem);

         // Return the new element
         return newItem;
      },

      // method for deleting an item from the data structure
      deleteItem: function (type, id) {

         var ids, index;

         ids = data.allItems[type].map(function (current) {
            return current.id;
         });

         index = ids.indexOf(id);

         if (index !== -1) {
            data.allItems[type].splice(index, 1);
         }

      },


      // function for calculating the budget
      calculateBudget: function () {

         // calculate total income and expenses
         calculateTotal('exp');
         calculateTotal('inc');
         // calculate the budget: income - expenses
         data.budget = data.totals.inc - data.totals.exp;

         // calculate the percentage of the income that is spent
         if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

         } else {
            data.percentage = -1;
         }

      },


      calculatePercentages: function () {
         data.allItems.exp.forEach(function (cur) {

            cur.calcPercentage(data.totals.inc);

         });
      },


      // we use map in getPercentages function because we want to return something

      getPercentages: function () {
         var allPerc = data.allItems.exp.map(function (cur) {
            return cur.getPercentage();
         });

         return allPerc;
      },


      // Returning the budget, totals and percentage
      getBudget: function () {
         return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage

         };
      },

      testing: function () {
         console.log(data);
      }
   };

})();



// ************** UIController module
var UIController = (function () {

   // DOM strings
   var DOMStrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputButton: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container',
      expensesPercLabel: '.item__percentage',
      dateLabel: '.budget__title--month'
   };

   /***************************************************************************************************************/
   // formatting  numbers
   var formatNumber = function (num, type) {

      var numSplit, int, dec;
      /*
      + or - before number
      exactly 2 decimal points
      comma separating the thousands
      */
      num = Math.abs(num);
      num = num.toFixed(2);

      numSplit = num.split('.');

      int = numSplit[0];

      if (int.length > 3) {
         int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
      }

      dec = numSplit[1];

      // type === 'exp' ? sign = '-' : sign = '+';

      return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

   };
   /************************************************************************************************************/


/**********************************************************************************************************/
   // working on the nodelist returnde from using the querySelectorAll method
   
   
   // looping over an array
   var nodeListForEach = function (list, callback) {

      for (var i = 0; i < list.length; i++) {
         callback(list[i], i);
      }
   };

   /************************************************************************************************/


   //returning from the UIcontroller module (PUBLIC METHODS =>>> ACCESSED IN THE GLOBAL SCOPE)
   return {
      getInput: function () {
         return {
            type: document.querySelector(DOMStrings.inputType).value,
            description: document.querySelector(DOMStrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
         };
      },

      // adding an item to the user interface
      addListItem: function (obj, type) {

         var html, newHtml, element;

         // 1. Create HTML string with placeholder text

         if (type === 'inc') {
            element = DOMStrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

         } else if (type === 'exp') {
            element = DOMStrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

         }

         // 2. Replace the placeholder text with some actual data
         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.description);
         newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

         // 3. Insert the HTML into the DOM
         document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

      },


      // method for deleting the list item on the UI
      deleteListItem: function (selectorID) {
         var el = document.getElementById(selectorID);
         el.parentNode.removeChild(el);
      },


      // clearing input fields
      clearFields: function () {
         var fields, fieldsArr;

         // the qeurySelectorAll method returns a string
         fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

         // converting a string to an array
         fieldsArr = Array.prototype.slice.call(fields);

         // using the callback finction to loop through the fieldsArr
         fieldsArr.forEach(function (current, index, array) {
            current.value = "";
         });

         // set the focus to the description
         fieldsArr[0].focus();

      },

      // displaying the budget to the UI
      displayBudget: function (obj) {

         var type;
         obj.budget > 0 ? type = 'inc' : type = 'exp';

         document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
         document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
         document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

         if (obj.percentage > 0) {
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';

         } else {
            document.querySelector(DOMStrings.percentageLabel).textContent = '---';

         }

      },


      /*************************************************************************/

      // displaying the percentages to the UI      
      displayPercentages: function (percentages) {

         // this returns a nodelist
         var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

         /*
         var nodeListForEach = function (list, callback) {

            for (var i = 0; i < list.length; i++) {
               callback(list[i], i);
            }
         };
         
         */

         nodeListForEach(fields, function (current, index) {

            if (percentages[index] > 0) {
               current.textContent = percentages[index] + '%';

            } else {
               current.textContent = '---';

            }

         });


      },
      /***************************************************************************/


      // displaying the date

      displayMonth: function () {

         var now, month, months, year;
         now = new Date();

         months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
         month = now.getMonth();
         year = now.getFullYear();
         document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;



      },

      // function for changing the type

      changedType: function () {

         var fields = document.querySelectorAll(
            DOMStrings.inputType + ',' +
            DOMStrings.inputDescription + ',' +
            DOMStrings.inputValue
         );
         
         nodeListForEach(fields, function(current) {
            
            current.classList.toggle('red-focus');                                    
         });
         
         document.querySelector(DOMStrings.inputButton).classList.toggle('red');
      },

      // returning the DOM strings
      getDOMStrings: function () {
         return DOMStrings;
      }
   };

})();




// ************* Global App Controller module
var controller = (function (budgetCtrl, UICtrl) {


   // function for the event listeners
   var setupEventListeners = function () {

      // getting the DOM strings
      var DOM = UICtrl.getDOMStrings();

      document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

      document.addEventListener('keypress', function (event) {
         if (event.keyCode === 13 || event.which === 13) {

            // 1. call the ctrlAddItem function
            ctrlAddItem();

         }

      });


      // Event Delegation for DELETING
      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);


      // change event for the input type
      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

   };


   // function for calculating and updating the budget
   var updateBudget = function () {

      var budget;

      // 1. Calculate the budget
      budgetCtrl.calculateBudget();

      // 2. Return the budget
      budget = budgetCtrl.getBudget();

      // 3. Display the budget on the UI
      UICtrl.displayBudget(budget);

   };


   // calculate and update percentages
   var updatePercentages = function () {
      // 1. calculate percentages
      budgetCtrl.calculatePercentages();

      // 2. Read percentages from the budget controller
      var percentages = budgetCtrl.getPercentages();

      // 3. Update the UI with the new percentages
      UICtrl.displayPercentages(percentages);

   };





   // ctrlAddItem function that is called up in the setup event listeners function
   // and calls the update budget function
   var ctrlAddItem = function () {

      var input, newItem;

      // 1. GEt the field input data
      input = UICtrl.getInput();

      if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
         // 2. Add the item to the budget controller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);

         // 3. Add the item to the UI
         UICtrl.addListItem(newItem, input.type);

         // 4. Clear fields
         UICtrl.clearFields();

         // 5. Calculate and update the budget
         updateBudget();

         // 6. calculate and update percentages
         updatePercentages();

      }
   };

   // ctrlDeleteItem function that is called up in the setup event listeners function
   var ctrlDeleteItem = function (event) {
      var itemID, splitID, type, ID;

      // traversing the DOM
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID) {

         // inc-1
         splitID = itemID.split('-');

         type = splitID[0];
         ID = parseInt(splitID[1]);

         // 1. Delete item form the data structure
         budgetCtrl.deleteItem(type, ID)

         // 2. Delete the item from the UI
         UICtrl.deleteListItem(itemID);

         // 3. update and display the new budget
         updateBudget();

         // 4. calculate and update percentages
         updatePercentages();

      }

   };


   return {
      init: function () {
         console.log('Application has been started');

         UICtrl.displayMonth();

         UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
         });


         setupEventListeners();
      }
   };


})(budgetController, UIController);


// calling the init function to the start application
controller.init();









// me
