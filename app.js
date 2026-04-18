var app = angular.module("libraryApp", []);

app.controller("LibraryController", function ($scope, $http) {

  var userId   = sessionStorage.getItem("loggedUserId");
  var userName = sessionStorage.getItem("loggedUser");
  var userRole = sessionStorage.getItem("loggedRole");

  if (!userId) { window.location.href = "login.html"; }

  $scope.userName       = userName;
  $scope.userRole       = userRole;
  $scope.currentSection = "books";
  $scope.books          = [];
  $scope.authors        = [];
  $scope.publishers     = [];
  $scope.borrowed       = [];
  $scope.reviews        = [];
  $scope.allUsers       = [];
  $scope.searchQuery    = "";
  $scope.cartCount      = JSON.parse(sessionStorage.getItem("lib_cart") || "[]").length;
  $scope.newBook        = { code:"", title:"", subject:"", author_id:"", publisher_id:"" };
  $scope.newAuthor      = { author_id:"", name:"" };
  $scope.newPublisher   = { publisher_id:"", name:"" };
  $scope.review         = { book_id:"", rating:"", review_text:"" };
  $scope.borrowedReport = [];           // admin-only: all users + their borrowed books
  $scope.reportFilter   = "";           // search/filter string for the report table

  /* ── Show Section ───────────────────────── */
  $scope.showSection = function(name) {
    $scope.currentSection = name;
    getBooks();
    getAuthors();
    getPublishers();
    if (name === "borrowed") { getBorrowed(); }
    if (name === "reviews")  { getReviews(); }
    if (name === "admin")    { getUsers(); getBorrowedReport(); }
  };

  /* ── Get Books ──────────────────────────── */
  function getBooks() {
    $http.get("http://localhost/library/books.php")
    .then(function(res) {
      if (res.data.success) { $scope.books = res.data.books; }
    });
  }

  /* ── Get Authors ────────────────────────── */
  function getAuthors() {
    $http.get("http://localhost/library/authors.php")
    .then(function(res) {
      if (res.data.success) { $scope.authors = res.data.authors; }
    });
  }

  /* ── Get Publishers ─────────────────────── */
  function getPublishers() {
    $http.get("http://localhost/library/publishers.php")
    .then(function(res) {
      if (res.data.success) { $scope.publishers = res.data.publishers; }
    });
  }

  /* ── Get Users ──────────────────────────── */
  function getUsers() {
    $http.get("http://localhost/library/users.php")
    .then(function(res) {
      if (res.data.success) { $scope.allUsers = res.data.users; }
    });
  }

  /* ── Get Borrowed ───────────────────────── */
  function getBorrowed() {
    $http.get("http://localhost/library/checkout.php?user_id=" + userId)
    .then(function(res) {
      if (res.data.success) { $scope.borrowed = res.data.borrowed; }
    });
  }

  /* ── Get Reviews ────────────────────────── */
  function getReviews() {
    $http.get("http://localhost/library/reviews.php")
    .then(function(res) {
      if (res.data.success) { $scope.reviews = res.data.reviews; }
    });
  }

  /* ── Get Borrowed Report (Admin) ─────────────────────────────────
   *  Calls borrowed_report.php which uses multi-table JOINs to fetch:
   *    users JOIN checkout JOIN books JOIN authors
   *  Result: every checkout row enriched with user & book details.
   * ──────────────────────────────────────────────────────────────── */
  function getBorrowedReport() {
    if (userRole !== "admin") return;          // safety guard on JS side too
    $http.get("http://localhost/library/borrowed_report.php?role=admin")
    .then(function(res) {
      if (res.data.success) {
        $scope.borrowedReport = res.data.report;
      }
    });
  }

  /* ── Refresh report manually from the UI ── */
  $scope.refreshBorrowedReport = function() { getBorrowedReport(); };

  /* ── Load on Start ──────────────────────── */
  getBooks();
  getAuthors();
  getPublishers();

  /* ── Add to Cart ────────────────────────── */
  $scope.addToCart = function(book) {
    var cart = JSON.parse(sessionStorage.getItem("lib_cart") || "[]");
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === book.id) {
        alert("This book is already in your cart!");
        return;
      }
    }
    cart.push(book);
    sessionStorage.setItem("lib_cart", JSON.stringify(cart));
    $scope.cartCount = cart.length;
    alert(book.title + " added to cart!");
  };

  /* ── Add Author ─────────────────────────── */
  $scope.addAuthor = function() {
    if (!$scope.newAuthor.author_id || !$scope.newAuthor.name) {
      alert("Both Author ID and Name are required.");
      return;
    }
    $http.post("http://localhost/library/authors.php", {
      author_id: $scope.newAuthor.author_id,
      name:      $scope.newAuthor.name
    })
    .then(function(res) {
      if (res.data.success) {
        alert("Author added successfully!");
        $scope.newAuthor = { author_id:"", name:"" };
        getAuthors();
      } else {
        alert(res.data.message);
      }
    });
  };

  /* ── Add Publisher ──────────────────────── */
  $scope.addPublisher = function() {
    if (!$scope.newPublisher.publisher_id || !$scope.newPublisher.name) {
      alert("Both Publisher ID and Name are required.");
      return;
    }
    $http.post("http://localhost/library/publishers.php", {
      publisher_id: $scope.newPublisher.publisher_id,
      name:         $scope.newPublisher.name
    })
    .then(function(res) {
      if (res.data.success) {
        alert("Publisher added successfully!");
        $scope.newPublisher = { publisher_id:"", name:"" };
        getPublishers();
      } else {
        alert(res.data.message);
      }
    });
  };

  /* ── Add Book ───────────────────────────── */
  $scope.addBook = function() {
    var msgEl = document.getElementById("bookMsg");
    msgEl.style.display = "none";
    var b = $scope.newBook;

    if (!b.code || !b.title || !b.subject) {
      msgEl.textContent = "Code, Title and Subject are required.";
      msgEl.style.display = "block";
      return;
    }

    var bookCodePattern = /^[A-Za-z]\d{3}$/;
    if (!bookCodePattern.test(b.code)) {
      msgEl.textContent = "Book Code must start with exactly 1 letter followed by exactly 3 digits (e.g. B007).";
      msgEl.style.display = "block";
      return;
    }

    $http.post("http://localhost/library/books.php", {
      code:         b.code,
      title:        b.title,
      subject:      b.subject,
      author_id:    b.author_id    ? parseInt(b.author_id)    : 0,
      publisher_id: b.publisher_id ? parseInt(b.publisher_id) : 0
    })
    .then(function(res) {
      if (res.data.success) {
        alert("Book added successfully!");
        $scope.newBook = { code:"", title:"", subject:"", author_id:"", publisher_id:"" };
        getBooks();
      } else {
        msgEl.textContent = res.data.message;
        msgEl.style.display = "block";
      }
    });
  };

  /* ── Delete Book ────────────────────────── */
  $scope.deleteBook = function(bookId) {
    if (!confirm("Delete this book?")) return;
    $http.delete("http://localhost/library/books.php", {
      data: { id: bookId },
      headers: { "Content-Type": "application/json" }
    })
    .then(function(res) {
      if (res.data.success) { getBooks(); }
    });
  };

  /* ── Submit Review ──────────────────────── */
  $scope.submitReview = function() {
    var msgEl = document.getElementById("reviewMsg");
    msgEl.style.display = "none";
    var r = $scope.review;

    if (!r.book_id || !r.rating || !r.review_text) {
      msgEl.textContent = "Please fill all review fields.";
      msgEl.style.display = "block";
      return;
    }

    if (r.rating < 1 || r.rating > 5) {
      msgEl.textContent = "Rating must be between 1 and 5.";
      msgEl.style.display = "block";
      return;
    }

    $http.post("http://localhost/library/reviews.php", {
      user_id:     userId,
      book_id:     r.book_id,
      rating:      r.rating,
      review_text: r.review_text
    })
    .then(function(res) {
      if (res.data.success) {
        alert("Review submitted successfully!");
        $scope.review = { book_id:"", rating:"", review_text:"" };
        getReviews();
      } else {
        msgEl.textContent = res.data.message;
        msgEl.style.display = "block";
      }
    });
  };

});
