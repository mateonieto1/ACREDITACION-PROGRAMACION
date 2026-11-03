document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginError = document.getElementById('login-error');
    const btnLogout = document.getElementById('btn-logout');

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value;
        const password = document.getElementById('password').value;
        const btnSubmit = document.querySelector('.btn-ingresar');
        
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
        loginError.style.display = 'none';

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });

            const data = await response.json();

            if (response.ok) {
                loginSection.style.display = 'none';
                dashboardSection.style.display = 'block';
                document.getElementById('nombre-admin').innerText = `Hola, ${data.nombre}`;
                
                //funcion para llenar la tabla
                cargarConsultas();
            } else {
                loginError.innerText = data.error || 'Credenciales incorrectas';
                loginError.style.display = 'block';
            }
        } catch (error) {
            loginError.innerText = 'Error de conexión con el servidor.';
            loginError.style.display = 'block';
        } finally {
            btnSubmit.innerHTML = 'Iniciar Sesión';
        }
    });

    btnLogout.addEventListener('click', () => {
        dashboardSection.style.display = 'none';
        loginSection.style.display = 'flex';
        formLogin.reset();
        document.getElementById('usuario').focus();
    });
});

// funcion para traer los tickets y armar la tabla
async function cargarConsultas() {
    try {
        const response = await fetch('/api/admin/consultas');
        const consultas = await response.json();
        
        const tbody = document.getElementById('tabla-body');
        tbody.innerHTML = ''; 

        consultas.forEach(c => {
            const tr = document.createElement('tr');
            
            // color dde laetiqueta segun el estado
            const badgeClass = c.estado === 'no leída' ? 'badge-nueva' : 'badge-leida';
            const estadoTexto = c.estado.toUpperCase();
            
            const fechaFormateada = new Date(c.fecha_envio).toLocaleString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            // boton de accion: si no está leida muestrael botony  si ya se leyo ponemos un tilde doble
            const accionHtml = c.estado === 'no leída' 
                ? `<button class="btn-leer" onclick="marcarLeida(${c.id_consulta})"><i class="fas fa-check"></i> Marcar Leída</button>`
                : `<span style="color: #00E5FF;"><i class="fas fa-check-double"></i> Verificada</span>`;

            tr.innerHTML = `
                <td>#${c.id_consulta}</td>
                <td>${fechaFormateada}</td>
                <td><strong>${c.nombre_cliente}</strong></td>
                <td>${c.asunto}<br><small style="color: #a0aec0;">Servicio: ${c.nombre_servicio}</small></td>
                <td><span class="${badgeClass}">${estadoTexto}</span></td>
                <td>${accionHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar la tabla:', error);
    }
}

// funcion global para que el boton pueda cambiar el estado en mysql
window.marcarLeida = async function(id) {
    try {
        const response = await fetch(`/api/admin/consultas/${id}/leer`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            // si salio bien volvemos a cargar la tabla para que se actualice el color
            cargarConsultas();
        }
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
    }
}