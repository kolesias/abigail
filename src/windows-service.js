const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
    name: 'Abigail',
    description: 'Asistente virtual para el hogar',
    script: 'G:\\Proyectos\\Personal\\Abigail\\src\\index.js',
    nodeOptions: [
    ],
    env: [
        {
            name: 'NODE_ENV',
            value: 'production'
        },
        {
            name: 'DEBUG',
            value: 'abigail:*'
        }
    ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

svc.install();