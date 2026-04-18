var app = angular.module("libraryApp", []);

app.controller("CheckoutController", function ($scope, $http) {

  var userId = sessionStorage.getItem("loggedUserId");
  if (!userId) { window.location.href = "login.html"; }

  $scope.borrowed = [];

  $http.get("http://localhost/library/checkout.php?user_id=" + userId)
  .then(function(res) {
    if (res.data.success) { $scope.borrowed = res.data.borrowed; }
  });

});