const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="styles/default-styles.css">

<nav class="navbar has-shadow is-info is-dark">
<div class="navbar-brand">
<img src="favicon.ico" alt="icon">
  <a class="navbar-burger" id="burger">
    <span></span>
    <span></span>
    <span></span>
  </a>
</div>

<div class="navbar-menu" id="nav-links">
    <div class="navbar-start">
        <a class="navbar-item is-hoverable" href="./index.html">
          Home
        </a>
    
        <a class="navbar-item is-hoverable" href="./app.html">
          App
        </a>
    
        <a class="navbar-item is-hoverable" href="./documentation.html">
          Documentation
        </a>
    </div>
</div>
</nav>
`;