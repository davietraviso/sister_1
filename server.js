
const WebSocket = require('ws');
const mysql = require('mysql2');

// Buat koneksi ke database
const db = mysql.createConnection({
    host: '127.0.0.1',     
    user: 'root',            
    password: '1234',           
    database: 'chat_database'     
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi ke database gagal:', err);
        return;
    }
    console.log('Terhubung ke database MySQL!');
});

// Koneksi ke server-server lain

const servers = ['ws://192.168.223.38:8080'];

let serverConnections = [];

servers.forEach((url) => {
    const ws = new WebSocket(url);
    ws.on('open', () => {
        console.log(`Terhubung ke server: ${url}`);
        serverConnections.push(ws);
    });

    // ws.on('message', (data) => {
    //     const message = data.toString();
    //     // console.log(`Pesan diterima dari ${url}:`, data);
    //     console.log(`Pesan diterima: ${message}`);
    //     // Kirim pesan ke klien lokal
    //     // wss.clients.forEach((client) => {
    //     //     if (client.readyState === WebSocket.OPEN) {
    //     //         client.send(data);
    //     //     }
    //     // });
    //     // forwardToClients(data); // Kirim ke klien lokal
    //     forwardToClients(message);
    // });

    // ws.on('message', (data) => {
    //     const message = data.toString();
    //     const [messageId, payload] = message.split('|');
    //     const [username, messageContent] = payload.split(': ');
    //     const timestamp = new Date(); // Tambahkan timestamp jika perlu
    
    //     console.log(`Pesan diterima dari server lain: ${payload}`);
    
    //     // Validasi apakah pesan sudah ada di database
    //     const query = 'SELECT COUNT(*) AS count FROM messages WHERE id = ?';
    //     db.query(query, [messageId], (err, results) => {
    //         if (err) {
    //             console.error('Gagal memeriksa pesan di database:', err);
    //             return;
    //         }
    
    //         if (results[0].count === 0) {
    //             // Simpan pesan ke database jika belum ada
    //             const insertQuery = 'INSERT INTO messages (id, username, message, timestamp) VALUES (?, ?, ?, ?)';
    //             db.query(insertQuery, [messageId, username, messageContent, timestamp], (err) => {
    //                 if (err) {
    //                     console.error('Gagal menyimpan pesan ke database:', err);
    //                 } else {
    //                     console.log('Pesan berhasil disimpan ke database.');
    //                 }
    //             });
    
    //             // Kirim ke klien lokal
    //             forwardToClients(payload);
    //         } else {
    //             console.log('Pesan duplikat diabaikan.');
    //         }
    //     });
    // });

    ws.on('message', (data) => {
        try {
            const message = data.toString();
    
            // Validasi format pesan
            if (!message.includes('|')) {
                console.error('Format pesan tidak valid:', message);
                return;
            }
    
            const [messageId, payload] = message.split('|');
            if (!payload) {
                console.error('Payload pesan kosong:', message);
                return;
            }
    
            const [username, messageContent] = payload.split(': ');
            if (!username || !messageContent) {
                console.error('Format payload tidak valid:', payload);
                return;
            }
    
            console.log(`Pesan diterima dari ${username}: ${messageContent}`);
    
            // Simpan pesan ke database jika belum ada
            const query = 'SELECT COUNT(*) AS count FROM messages WHERE id = ?';
            db.query(query, [messageId], (err, results) => {
                if (err) {
                    console.error('Gagal memeriksa pesan di database:', err);
                    return;
                }
    
                if (results[0].count === 0) {
                    const insertQuery = 'INSERT INTO messages (id, username, message, timestamp) VALUES (?, ?, ?, ?)';
                    db.query(insertQuery, [messageId, username, messageContent, new Date()], (err) => {
                        if (err) {
                            console.error('Gagal menyimpan pesan ke database:', err);
                        } else {
                            console.log('Pesan berhasil disimpan ke database.');
                        }
                    });
    
                    // Kirim ke klien lokal
                    forwardToClients(`${username}: ${messageContent}`);
                } else {
                    console.log('Pesan duplikat diabaikan.');
                }
            });
        } catch (err) {
            console.error('Error memproses pesan:', err.message);
        }
    });

    ws.on('error', (err) => {
        console.error(`Gagal terhubung ke server: ${url}`, err.message);
    });
});




// Buat server WebSocket
const wss = new WebSocket.Server({ port: 8080 });

console.log('Server berjalan di ws://localhost:8080');

// Fungsi untuk meneruskan pesan ke semua klien lokal
const forwardToClients = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};


// Modifikasi di dalam `wss.on('connection')`
const { v4: uuidv4 } = require('uuid'); // Tambahkan library UUID

const activeUsers = new Set(); // Gunakan Set untuk memastikan nama unik


wss.on('connection', (socket) => {
    console.log('Pengguna terhubung.');

    // Kirim riwayat pesan ke klien baru saat mereka terhubung
    const query = 'SELECT username, message FROM messages ORDER BY timestamp ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Gagal mengambil pesan dari database:', err);
            return;
        }
        results.forEach((row) => {
            // Kirim hanya username dan pesan
            socket.send(`${row.username}: ${row.message}`);
        });
    });

    let currentUsername = null; 

    // Event untuk menerima pesan baru dari klien
    socket.on('message', (data) => {
        try {
            const message = data.toString();
            console.log(`Pesan diterima: ${message}`);

            // Generate UUID untuk pesan
            const messageId = uuidv4();
            const timestamp = new Date();

            // Pisahkan username dan pesan
            const [username, messageContent] = message.split(': ');

            if (!username || !messageContent) {
                throw new Error('Format pesan tidak valid.');
            }

            // Simpan pesan jika belum ada
            const query = 'SELECT COUNT(*) AS count FROM messages WHERE id = ?';
            db.query(query, [messageId], (err, results) => {
                if (err) {
                    console.error('Gagal memeriksa pesan di database:', err);
                    return;
                }

                if (results[0].count === 0) {
                    const insertQuery = 'INSERT INTO messages (id, username, message, timestamp) VALUES (?, ?, ?, ?)';
                    db.query(insertQuery, [messageId, username, messageContent, timestamp], (err) => {
                        if (err) {
                            console.error('Gagal menyimpan pesan ke database:', err);
                        } else {
                            console.log('Pesan berhasil disimpan ke database.');
                        }
                    });
                } else {
                    console.log('Pesan duplikat diabaikan.');
                }
            });

            // Kirim ke semua klien
            forwardToClients(`${username}: ${messageContent}`);
            serverConnections.forEach((server) => {
                if (server.readyState === WebSocket.OPEN) {
                    server.send(`${messageId}|${username}: ${messageContent}`);
                }
            });
        } catch (err) {
            console.error('Error memproses pesan:', err.message);
        }
    });
});


// wss.on('connection', (socket) => {
//     console.log('Pengguna terhubung.');

//     // Kirim riwayat pesan ke klien baru saat mereka terhubung
//     const query = 'SELECT username, message FROM messages ORDER BY timestamp ASC';
//     db.query(query, (err, results) => {
//         if (err) {
//             console.error('Gagal mengambil pesan dari database:', err);
//             return;
//         }
//         // Kirim riwayat pesan ke klien
//         results.forEach((row) => {
//             socket.send(`${row.username}: ${row.message}`);
//         });
//     });

//     // Event untuk menerima pesan baru dari klien
//     socket.on('message', (data) => {
        
//         try {
//         // Konversi data menjadi string
//         const message = data.toString();

//         // Simpan pesan ke database
//         const [username, messageContent] = message.split(': ');

//         if (!username || !messageContent) {
//             throw new Error('Format pesan tidak valid.');
//         }

//         // Simpan pesan ke database
//         const query = 'INSERT INTO messages (username, message) VALUES (?, ?)';
//         db.query(query, [username, messageContent], (err) => {
//             if (err) {
//                 console.error('Gagal menyimpan pesan ke database:', err);
//             }
//         });

//         // Kirim pesan baru ke semua klien
//         wss.clients.forEach((client) => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(`${username}: ${messageContent}`);
//             }
//         });
//     } catch (err) {
//         console.error('Error memproses pesan:', err.message);
//     }
//     });
// });
