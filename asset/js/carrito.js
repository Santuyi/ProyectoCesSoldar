const carritoKey = "cesSoldarCarrito";
const catalogo = document.querySelector("#catalogo-productos");
const filtrosCategorias = document.querySelector(".chips-categorias");
const productosUrl = "../asset/data/productos.json";
const telefonoWhatsApp = "543585417530";

let carrito = (JSON.parse(localStorage.getItem(carritoKey)) || []).map((producto) => ({
    ...producto,
    id: Number(producto.id),
}));
let productos = [];
let categoriaActiva = "Todos";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
});

const mostrarNotificacion = (mensaje, tipo = "ok") => {
    if (typeof Toastify !== "function") {
        return;
    }

    Toastify({
        text: mensaje,
        duration: 2600,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: tipo === "error" ? "#b42318" : "#2f5f8f",
            borderRadius: "8px",
        },
    }).showToast();
};

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
    const navegador = document.querySelector(".contenedor-nav");
    const carritoHTML = document.createElement("aside");
    carritoHTML.className = "carrito";
    carritoHTML.innerHTML = `
        <button class="carrito-boton" type="button" aria-label="Abrir carrito">
            <i class="bi bi-cart3" aria-hidden="true"></i>
            <span class="carrito-texto">Carrito</span>
            <span class="carrito-contador">0</span>
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
                <button class="carrito-consultar" type="button">Consultar compra</button>
            </div>
        </div>
    `;

    if (navegador) {
        navegador.appendChild(carritoHTML);
    } else {
        document.body.appendChild(carritoHTML);
    }
};

const abrirCarrito = () => {
    document.querySelector(".carrito").classList.add("carrito-abierto");
};

const cerrarCarrito = () => {
    document.querySelector(".carrito").classList.remove("carrito-abierto");
};

const renderizarCatalogo = () => {
    const productosFiltrados = categoriaActiva === "Todos"
        ? productos
        : productos.filter((producto) => producto.categoria === categoriaActiva);

    if (productosFiltrados.length === 0) {
        catalogo.innerHTML = `<p class="catalogo-estado">No hay productos disponibles en esta categoria.</p>`;
        return;
    }

    catalogo.innerHTML = productosFiltrados.map((producto) => `
        <article class="tarjeta-producto" data-id="${producto.id}">
            <img src="${producto.imagen}" alt="${producto.alt}">
            <div class="tarjeta-producto-info">
                <span class="categoria-producto">${producto.categoria}</span>
                <h2>${producto.nombre}</h2>
                <p>${producto.descripcion}</p>
                <div class="pie-tarjeta-producto">
                    <strong>${formatoPrecio.format(producto.precio)}</strong>
                    <button type="button" data-agregar="${producto.id}">Agregar al carrito</button>
                </div>
            </div>
        </article>
    `).join("");
};

const renderizarCarrito = () => {
    const contador = document.querySelector(".carrito-contador");
    const lista = document.querySelector(".carrito-lista");
    const vacio = document.querySelector(".carrito-vacio");
    const total = document.querySelector(".carrito-total");
    const consultar = document.querySelector(".carrito-consultar");

    contador.textContent = calcularCantidadTotal();
    total.textContent = formatoPrecio.format(calcularTotal());
    lista.innerHTML = "";
    vacio.classList.toggle("carrito-vacio-visible", carrito.length === 0);
    consultar.disabled = carrito.length === 0;

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
    mostrarNotificacion(`${productoNuevo.nombre} agregado al carrito`);
};

const cambiarCantidad = (id, cantidad) => {
    const producto = carrito.find((item) => Number(item.id) === id);

    if (!producto) {
        return;
    }

    producto.cantidad += cantidad;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter((item) => Number(item.id) !== id);
    }

    guardarCarrito();
    renderizarCarrito();
};

const eliminarProducto = (id) => {
    carrito = carrito.filter((producto) => Number(producto.id) !== id);
    guardarCarrito();
    renderizarCarrito();
    mostrarNotificacion("Producto eliminado del carrito");
};

const vaciarCarrito = () => {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
    mostrarNotificacion("Carrito vaciado");
};

const finalizarCompra = () => {
    if (carrito.length === 0) {
        mostrarNotificacion("Agrega productos antes de consultar", "error");
        return;
    }

    const detalle = carrito
        .map((producto) => `${producto.cantidad} x ${producto.nombre} - ${formatoPrecio.format(producto.precio * producto.cantidad)}`)
        .join("\n");
    const mensaje = `Hola Ces Soldar, quiero consultar por esta compra:\n${detalle}\nTotal: ${formatoPrecio.format(calcularTotal())}`;
    const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    mostrarNotificacion("Consulta preparada en WhatsApp");
};

const cargarProductos = async () => {
    try {
        const respuesta = await fetch(productosUrl);

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el catalogo");
        }

        productos = await respuesta.json();
        renderizarCatalogo();
    } catch (error) {
        catalogo.innerHTML = `<p class="catalogo-estado">No pudimos cargar los productos. Intenta nuevamente mas tarde.</p>`;
        mostrarNotificacion("Error al cargar productos", "error");
    }
};

crearCarrito();
renderizarCarrito();
cargarProductos();

catalogo.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-agregar]");

    if (!boton) {
        return;
    }

    const id = Number(boton.dataset.agregar);
    const producto = productos.find((item) => item.id === id);

    if (producto) {
        agregarProducto(producto);
    }
});

filtrosCategorias.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-categoria]");

    if (!boton) {
        return;
    }

    categoriaActiva = boton.dataset.categoria;
    filtrosCategorias.querySelector(".chip-activo").classList.remove("chip-activo");
    boton.classList.add("chip-activo");
    renderizarCatalogo();
});

document.querySelector(".carrito-boton").addEventListener("click", abrirCarrito);
document.querySelector(".carrito-cerrar").addEventListener("click", cerrarCarrito);
document.querySelector(".carrito-vaciar").addEventListener("click", vaciarCarrito);
document.querySelector(".carrito-consultar").addEventListener("click", finalizarCompra);

document.querySelector(".carrito-lista").addEventListener("click", (evento) => {
    const boton = evento.target;

    if (boton.dataset.sumar) {
        cambiarCantidad(Number(boton.dataset.sumar), 1);
    }

    if (boton.dataset.restar) {
        cambiarCantidad(Number(boton.dataset.restar), -1);
    }

    if (boton.dataset.eliminar) {
        eliminarProducto(Number(boton.dataset.eliminar));
    }
});
