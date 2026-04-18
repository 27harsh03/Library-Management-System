var selectedRole = "student";

function selectRole(role) {
  selectedRole = role;

  document.getElementById("role").value = role;

  document.getElementById("role-student").classList.remove("active");
  document.getElementById("role-teacher").classList.remove("active");

  var selectedBtn = document.getElementById("role-" + role);
  selectedBtn.classList.add("active");

  if (role === "teacher") {
    document.getElementById("courseDiv").style.display = "none";
    document.getElementById("deptDiv").style.display = "block";
  } else {
    document.getElementById("courseDiv").style.display = "block";
    document.getElementById("deptDiv").style.display = "none";
  }
}

function signupUser() {
  var name = document.getElementById("name").value.trim();
  var email = document.getElementById("email").value.trim();
  var phone = document.getElementById("phone").value.trim();
  var age = document.getElementById("age").value.trim();
  var password = document.getElementById("password").value;
  var sap = document.getElementById("sap_id").value.trim();
  var role = document.getElementById("role").value;

  var course = "";
  var department = "";

  if (role === "student") {
    course = document.getElementById("course").value.trim();
  } else {
    department = document.getElementById("department").value.trim();
  }

  var errorBox = document.getElementById("errorMsg");
  var successBox = document.getElementById("successMsg");

  errorBox.style.display = "none";
  successBox.style.display = "none";

  if (!name || !email || !phone || !age || !password || !sap) {
    errorBox.innerText = "All fields are required";
    errorBox.style.display = "block";
    return;
  }

  if (password.length < 6) {
    errorBox.innerText = "Password must be at least 6 characters";
    errorBox.style.display = "block";
    return;
  }

  if (email.indexOf("@") === -1) {
    errorBox.innerText = "Enter a valid email";
    errorBox.style.display = "block";
    return;
  }

  fetch("http://localhost/library/signup.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      email: email,
      phone: phone,
      age: age,
      password: password,
      role: role,
      sap_id: sap,
      course: course,
      department: department
    })
  })
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    if (data.success) {
      successBox.innerText = "Account created, redirecting...";
      successBox.style.display = "block";

      setTimeout(function() {
        window.location.href = "login.html";
      }, 1200);
    } else {
      errorBox.innerText = data.message;
      errorBox.style.display = "block";
    }
  })
  .catch(function() {
    errorBox.innerText = "Server not responding. Check XAMPP.";
    errorBox.style.display = "block";
  });
}

function loginUser() {
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;

  var errorBox = document.getElementById("errorMsg");
  var successBox = document.getElementById("successMsg");

  errorBox.style.display = "none";
  successBox.style.display = "none";

  if (!email || !password) {
    errorBox.innerText = "Please fill all fields";
    errorBox.style.display = "block";
    return;
  }

  fetch("http://localhost/library/login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    if (data.success) {
      sessionStorage.setItem("loggedUser", data.name);
      sessionStorage.setItem("loggedUserId", data.id);
      sessionStorage.setItem("loggedRole", data.role);

      successBox.innerText = "Login successful";
      successBox.style.display = "block";

      setTimeout(function() {
        window.location.href = "dashboard.html";
      }, 800);
    } else {
      errorBox.innerText = data.message;
      errorBox.style.display = "block";
    }
  })
  .catch(function() {
    errorBox.innerText = "Server error. Try again.";
    errorBox.style.display = "block";
  });
}

function logoutUser() {
  sessionStorage.clear();
}