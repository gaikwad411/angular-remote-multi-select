// Code goes here
angular.module('demo', [])

.controller('demoCtrl', ['$scope', function ($scope){
  $scope.message = 'Controller Ready!';
  $scope.country = [{'id': '1', 'title': 'India', 'selected' : true}];
  
}])

.directive('myMultiSelect', function ($http, $compile, $q){
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function($scope, $elm, $attrs, ngModelCtrl){
        // Pagination Object
        $scope.pagi5n = {
          currentPage: 1,
          itemCount: 0,
          pageCount: 0,
          pageNumWinLimit: 2,
          
          pageNumWindow: [],
          itemsPerPage: 5,
          load: function (itemCount, currentPage, itemsPerPage){
            this.itemsPerPage = itemsPerPage || this.itemsPerPage;
            this.currentPage = currentPage || this.currentPage;
            this.itemCount = itemCount;
            // Calculate page count
            this.pageCount = Math.ceil(this.itemCount/this.itemsPerPage);
            this.createPageNumWindow();
          },
          createPageNumWindow: function (){
            // Reset page num window
            this.pageNumWindow = [];
            
            if(this.pageNumWinLimit >= this.pageCount){
              this.pageNumWinLimit = this.pageCount;
            }
            
            var windowStart 
              = this.currentPage - Math.ceil(this.pageNumWinLimit/2);
            
            if(windowStart < 1)
            {
              windowStart =1;
            }
            var windowEnd = windowStart + this.pageNumWinLimit;
            if(windowEnd > this.pageCount){
              windowEnd = this.pageCount;
            }
            for(var i = windowStart; i <= windowEnd; i++){
              this.pageNumWindow.push(i);          
            }
          },
          goToPage: function(page) {
            this.currentPage = page;
            loadResult();
          },
          goToFirstPage: function() {
            this.goToPage(1);
          },
          goToNextPage: function(){
            this.goToPage(this.currentPage+1);
          },
          goToPrevPage: function(){
            this.goToPage(this.currentPage-1);
          },
          goToLastPage: function(){
            this.goToPage(this.pageCount);
          },
        };
        
        // Search list
        $scope.remoteItemsList = {
          isLoading: false,
          items: false,
          itemCount: 0,
          
        };
        
        // Search params object
        $scope.searchParams = {
          searchRemote: '',
          searchSelected: ''
        };
        
        // Set selected items as emtpy
        $scope.seletectedItems = [];
        
        var pkFieldOfItem = 'id';
        var titleFieldOfItem = 'title';
        
        $scope.itemIndex = pkFieldOfItem;
        
        // load selected data into new items
        var loadSelDataToNewItems = function (){
          // Check if new item can be set 
          // as selected if it is already in 
          // selected list
          
          // Foreach selected item
          angular.forEach($scope.seletectedItems, 
            function (modelItem){
              // for each new item
              // in current page
              angular.forEach($scope.items, 
              function (newItem, newItemIndx){
                if(modelItem[pkFieldOfItem] 
                      === newItem[pkFieldOfItem]){
                  $scope.items[newItemIndx].selected 
                    = modelItem.selected;
                }
              });
          });
            
        };
        
        
        // Load initial data into selected items
        // For each selected item in the input model list
        // push it into selected list
        var loadModelDataToSelData = function (){
            angular.forEach($scope[$attrs['ngModel']], 
              function (modelItem, modelItemIndx){
                var modelItmFound = false;
                
                // For reach selected item check
                // if it matches with this model item
                angular.forEach($scope.seletectedItems, 
                  function (selItem, selItemIndx){
                    if(selItem[pkFieldOfItem] 
                          === modelItem[pkFieldOfItem]){
                      $scope.items[selItemIndx].selected 
                        = modelItem.selected;
                      modelItmFound = true;  
                    }
                });
                
                if(modelItmFound=== false && 
                    modelItem.selected === true){
                  $scope.seletectedItems.push(modelItem);  
                }
                
            });
        };
        
        
        
        
        
        
        
        
        var getData = function (searchParams){
          var q = $q.defer();
          
          setTimeout(function (){
            var res = [];
            if(searchParams.page ===1){
              res = [
                {id: '1', title: 'India'},
                {id: '2', title: 'Japan'},
                {id: '3', title: 'Korea'}
              ];
            }else{
              res = [
                  {id: '4', title: 'Lebnan'},
                  {id: '5', title: 'Malesia'},
                  {id: '6', title: 'Nigeria'}
                ];
            }
            q.resolve({
              count: 6,
              results: res
            });
            
            
          }, 2000);
          
          return q.promise;
          
        };
        
        // Function to open select box
        $scope.openSelectBox = function(){
          $scope.selectBoxOpened = !$scope.selectBoxOpened
          
        };
        
        // Function to handle select item action
        $scope.selectItem = function(item){
          if(item.selected){
            item.selected = false;
            // Remove it from selected list
            angular.forEach($scope.seletectedItems, 
              function (selItem, selItemIndx){
              if(selItem[pkFieldOfItem] === item[pkFieldOfItem])
              {
                $scope.seletectedItems.splice(selItemIndx, 1);
              }
            });
            
          }else{
            // Add it to selected list
            item.selected = true;
            $scope.seletectedItems.push(item);
          }
          $scope[$attrs['ngModel']] = $scope.seletectedItems;
          
          showSelDataInInput();
        };
        
        // Function to show selected data in input
        $scope.selList = '';
        var showSelDataInInput = function (){
          var titleStr = [];
          if($scope.seletectedItems.length>=1){
            titleStr.push($scope.seletectedItems[0][titleFieldOfItem]);
          }
          if($scope.seletectedItems.length>=2){
            titleStr.push('And (' + $scope.seletectedItems.length + ')')
          }
          $scope.selList = titleStr.join(', ');
        };
        
        var initTemplate = function (){
          var template = "<input type=\"text\" name=\"selList\" data-ng-model=\"selList\" readonly=\"readonly\"/ data-ng-class='{\"loading-input\":remoteItemsList.isLoading===true}'><button data-ng-disabled=\"remoteItemsList.isLoading\" ng-click='openSelectBox()'>Select</button>"
          + "<div class='list-wrapper' data-ng-show='selectBoxOpened'>"
          
          + "<div class=\"remote-list\" data-ng-class=\"{'list-loading': remoteItemsList.isLoading===true }\">" 
          + "<div class=\"list-head\">Search All</div>"
          + "<input data-ng-change=\"remoteSearchKeyChanged()\" type=\"text\" name=\"search\" id=\"search\" data-ng-model=\"searchParams.searchRemote\" />"
          + "<ul>"
          + "<li data-ng-repeat='item in items track by $index' data-ng-class='{\"selelcted-item\": item.selected === true}' data-ng-click='selectItem(item)'>{{item.title}}</li>"
          + "</ul>"
          
          + "<div class=\"pagi5n-wrap\" data-ng-show='pagi5n.itemCount>0'>"
          + "<button type='button' data-ng-click='pagi5n.goToFirstPage()'>First</button>" 
          + "<button type='button' data-ng-show='pagi5n.currentPage<pagi5n.pageCount' data-ng-click='pagi5n.goToNextPage()'>Next</button>"
          + "<span data-ng-show='pai5n.pageNumWindow[0] && pai5n.pageNumWindow[0].value > 1'>...</span>"
          + "<button type='button' data-ng-class='{\"current-page\":pagi5n.currentPage===page}' data-ng-repeat='page in pagi5n.pageNumWindow track by $index' data-ng-click='pagi5n.goToPage(page)' data-ng-bind='page'></button>" 
          + "<span data-ng-show='pai5n.pageNumWindow[pai5n.pageNumWindow.length-1] && pagi5n.pageNumWindow[pai5n.pageNumWindow.length-1].value < pagi5n.pageCount'>...</span>"
          + "<button type='button' data-ng-show='pagi5n.currentPage>1' data-ng-click='pagi5n.goToPrevPage()'>Prev</button>" 
          + "<button type='button' data-ng-click='pagi5n.goToLastPage()'>Last</button>"
          +"</div>"
          
          + "</div>"
          
          + "<div class=\"selected-list\">" 
          + "<div class=\"list-head\">Search Selected</div>"
          + "<input type=\"text\" name=\"sel-list-search\" id=\"sel-list-search\" data-ng-model=\"searchParams.searchSelected\" />"
          + "<ul>"
          + "<li data-ng-repeat='item in seletectedItems | filter:searchParams.searchSelected track by $index' data-ng-class='{\"selelcted-item\": item.selected === true}'>{{item.title}}</li>"
          + "</ul>"
          + "</div>"
          +"</div>";
          var linkFn = $compile(template);
          var content = linkFn($scope);
          $($elm).hide();
          $($elm).after(content);
        };
        
        
        // Funtion to handle action for remote search result
        $scope.remoteSearchKeyChanged = function (){
          loadResult();
        };
        
        
        // Load result
        var loadResult = function (){
          $scope.selList = 'Loading...';
          $scope.remoteItemsList.isLoading = true;
          $scope.searchParams['page'] = $scope.pagi5n['currentPage'];
          getData($scope.searchParams)
          .then(function (data){
            $scope.items = data.results;
            $scope.pagi5n.load(data.count);
            
            loadSelDataToNewItems();
            showSelDataInInput();  
          })
          .finally(function (){
            $scope.remoteItemsList.isLoading = false;
          });
        };
        
        // Init
        initTemplate();
        loadModelDataToSelData();
        loadResult();
        

    }
  };
});

