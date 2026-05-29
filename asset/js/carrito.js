const carritoKey = "cesSoldarCarrito";
const tarjetasProducto = document.querySelectorAll(".tarjeta-producto");

let carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];

const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
});

const guardarCarrito = () => {
    localStorage.setItem(carritoKey, JSON.stringify(carrito));
};

const calcularCantidadTotal = () => {
    return carrito.reduce((total, producto) => total + producto.cantidad, 0);
};

const calcularTotal = () => {
    return carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
};

const crearCarrito = () => {
    const carritoHTML = document.createElement("aside");
    carritoHTML.className = "carrito";
    carritoHTML.innerHTML = `
        <button class="carrito-boton" type="button" aria-label="Abrir carrito">
            Carrito <span class="carrito-contador">0</span>
        </button>
        <div class="carrito-panel" aria-live="polite">
            <div class="carrito-encabezado">
                <h2>Tu carrito</h2>
                <button class="carrito-cerrar" type="button" aria-label="Cerrar carrito">x</button>
            </div>
            <div class="carrito-lista"></div>
            <div class="carrito-vacio">Todavia no agregaste productos.</div>
            <div class="carrito-resumen">
                <strong>Total</strong>
                <span class="carrito-total">$0</span>
            </div>
            <div class="carrito-acciones">
                <button class="carrito-vaciar" type="button">Vaciar</button>
                <a class="carrito-consultar" href="./contactos.html">Consultar compra</a>
            </div>
        </div>
    `;

    document.body.appendChild(carritoHTML);
};

const abrirCarrito = () => {
    document.querySelector(".carrito").classList.add("carrito-abierto");
};

const cerrarCarrito = () => {
    document.querySelector(".carrito").classList.remove("carrito-abierto");
};

const renderizarCarrito = () => {
    const contador = document.querySelector(".carrito-contador");
    const lista = document.querySelector(".carrito-lista");
    const vacio = document.querySelector(".carrito-vacio");
    const total = document.querySelector(".carrito-total");

    contador.textContent = calcularCantidadTotal();
    total.textContent = formatoPrecio.format(calcularTotal());
    lista.innerHTML = "";
    vacio.classList.toggle("carrito-vacio-visible", carrito.length === 0);

    carrito.forEach((producto) => {
        const item = document.createElement("article");
        item.className = "carrito-item";
        item.innerHTML = `
            <div>
                <h3>${producto.nombre}</h3>
                <p>${formatoPrecio.format(producto.precio)}</p>
            </div>
            <div class="carrito-cantidad">
                <button type="button" data-restar="${producto.id}" aria-label="Restar ${producto.nombre}">-</button>
                <span>${producto.cantidad}</span>
                <button type="button" data-sumar="${producto.id}" aria-label="Sumar ${producto.nombre}">+</button>
            </div>
            <button class="carrito-eliminar" type="button" data-eliminar="${producto.id}" aria-label="Eliminar ${producto.nombre}">Eliminar</button>
        `;

        lista.appendChild(item);
    });
};

const agregarProducto = (productoNuevo) => {
    const productoEnCarrito = carrito.find((producto) => producto.id === productoNuevo.id);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({ ...productoNuevo, cantidad: 1 });
    }

    guardarCarrito();
    renderizarCarrito();
    abrirCarrito();
};

const cambiarCantidad = (id, cantidad) => {
    const producto = carrito.find((item) => item.id === id);

    if (!producto) {
        return;
    }

    producto.cantidad += cantidad;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter((item) => item.id !== id);
    }

    guardarCarrito();
    renderizarCarrito();
};

const eliminarProducto = (id) => {
    carrito = carrito.filter((producto) => producto.id !== id);
    guardarCarrito();
    renderizarCarrito();
};

const vaciarCarrito = () => {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
};

crearCarrito();
renderizarCarrito();

tarjetasProducto.forEach((tarjeta) => {
    const boton = tarjeta.querySelector("button");

    boton.addEventListener("click", () => {
        agregarProducto({
            id: tarjeta.dataset.id,
            nombre: tarjeta.dataset.nombre,
            categoria: tarjeta.dataset.categoria,
            precio: Number(tarjeta.dataset.precio),
        });
    });
});

document.querySelector(".carrito-boton").addEventListener("click", abrirCarrito);
document.querySelector(".carrito-cerrar").addEventListener("click", cerrarCarrito);
document.querySelector(".carrito-vaciar").addEventListener("click", vaciarCarrito);

document.querySelector(".carrito-lista").addEventListener("click", (evento) => {
    const boton = evento.target;

    if (boton.dataset.sumar) {
        cambiarCantidad(boton.dataset.sumar, 1);
    }

    if (boton.dataset.restar) {
        cambiarCantidad(boton.dataset.restar, -1);
    }

    if (boton.dataset.eliminar) {
        eliminarProducto(boton.dataset.eliminar);
    }
});
