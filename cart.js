var app = angular.module("libraryApp", []);

app.controller("CartController", function ($scope, $http) {

  var userId = sessionStorage.getItem("loggedUserId");
  if (!userId) { window.location.href = "login.html"; }

  $scope.cart = JSON.parse(sessionStorage.getItem("lib_cart") || "[]");

  $scope.removeFromCart = function(index) {
    $scope.cart.splice(index, 1);
    sessionStorage.setItem("lib_cart", JSON.stringify($scope.cart));
  };

  $scope.checkoutCart = function() {
    if ($scope.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    var bookIds = [];
    for (var i = 0; i < $scope.cart.length; i++) {
      bookIds.push($scope.cart[i].id);
    }

    $http.post("http://localhost/library/checkout.php", {
      user_id:  userId,
      book_ids: bookIds
    })
    .then(function(res) {
      if (res.data.success) {
        sessionStorage.setItem("lib_cart", "[]");
        $scope.cart = [];
        alert("Books borrowed successfully! Return within 14 days.");
        window.location.href = "checkout.html";
      } else {
        alert(res.data.message);
      }
    });
  };

});