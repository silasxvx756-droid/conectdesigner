
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// ==========================================
// CONFIGURAÇÕES GERAIS
// ==========================================

const app = express();
const PORT = process.env.PORT || 3000;

const NEHTW_URL = (
  process.env.NEHTW_API_URL || 'https://nehtw.com/api'
).replace(/\/+$/, '');

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// MODELO MONGODB
// ==========================================

const orderSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true, unique: true },
    site: String,
    fileId: String,
    sourceUrl: String,
    status: { type: String, default: 'queued' },
    response: mongoose.Schema.Types.Mixed,
    downloadLinks: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true }
);

const Order =
  mongoose.models.Order ||
  mongoose.model('Order', orderSchema);

// ==========================================
// CONEXÃO MONGODB
// ==========================================

async function connectMongoDB() {
  if (!process.env.MONGO_URI) {
    console.log('MONGO_URI não configurada.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro MongoDB:', error.message);
  }
}

// ==========================================
// CLOUDINARY
// ==========================================

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log('Cloudinary configurado.');
} else {
  console.log('Cloudinary não configurado.');
}

// ==========================================
// NODEMAILER
// ==========================================

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log('Nodemailer configurado.');
}

// ==========================================
// JWT
// ==========================================

const jwtConfigured = Boolean(process.env.JWT_SECRET);

console.log(
  jwtConfigured ? 'JWT configurado.' : 'JWT_SECRET ausente.'
);

// ==========================================
// CLERK
// ==========================================

const clerkConfigured = Boolean(
  process.env.CLERK_SECRET_KEY &&
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
);

console.log(
  clerkConfigured ? 'Clerk configurado.' : 'Clerk não configurado.'
);

// ==========================================
// NEHTW VIP
// ==========================================

const nehtwConfigured = Boolean(process.env.NEHTW_API_KEY);

console.log(
  nehtwConfigured
    ? 'NEHTW API KEY configurada.'
    : 'NEHTW_API_KEY ausente.'
);

// ==========================================
// COMUNICAÇÃO COM NEHTW
// ==========================================

async function nehtwRequest(endpoint, options = {}) {
  if (!process.env.NEHTW_API_KEY) {
    throw new Error('NEHTW_API_KEY não configurada.');
  }

  const response = await fetch(`${NEHTW_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'X-Api-Key': process.env.NEHTW_API_KEY,
      ...options.headers,
    },
    signal: AbortSignal.timeout(30000),
  });

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    data = { message: responseText };
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Erro NEHTW HTTP ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

// ==========================================
// SERVIDOR
// ==========================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor DESIGNI funcionando!',
    version: '3.0.0',
    services: {
      mongodb: mongoose.connection.readyState === 1,
      cloudinary: cloudinaryConfigured,
      email: Boolean(transporter),
      jwt: jwtConfigured,
      clerk: clerkConfigured,
      nehtw: nehtwConfigured,
    },
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// TESTE MONGODB
// ==========================================

app.get('/test/mongodb', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB não conectado.',
      });
    }

    await mongoose.connection.db.admin().ping();

    res.json({
      success: true,
      message: 'MongoDB funcionando.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// TESTE CLOUDINARY
// ==========================================

app.get('/test/cloudinary', (req, res) => {
  res.json({
    success: cloudinaryConfigured,
    message: cloudinaryConfigured
      ? 'Cloudinary configurado.'
      : 'Cloudinary não configurado.',
  });
});

// ==========================================
// TESTE EMAIL
// ==========================================

app.get('/test/email', async (req, res) => {
  try {
    if (!transporter) {
      return res.status(503).json({
        success: false,
        message: 'E-mail não configurado.',
      });
    }

    await transporter.verify();

    res.json({
      success: true,
      message: 'E-mail funcionando.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==========================================
// TESTE JWT
// ==========================================

app.get('/test/jwt', (req, res) => {
  try {
    if (!jwtConfigured) {
      return res.status(503).json({
        success: false,
        message: 'JWT_SECRET ausente.',
      });
    }

    const token = jwt.sign(
      { test: true },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      success: true,
      verified: true,
      message: 'JWT funcionando.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==========================================
// TESTE CLERK
// ==========================================

app.get('/test/clerk', (req, res) => {
  res.json({
    success: clerkConfigured,
    configured: clerkConfigured,
    message: clerkConfigured
      ? 'Variáveis Clerk encontradas.'
      : 'Verifique as variáveis Clerk.',
  });
});

// ==========================================
// TESTE NEHTW VIP
// ==========================================

app.get('/test/api-vip', async (req, res) => {
  try {
    const data = await nehtwRequest('/stocksites');

    res.json({
      success: true,
      configured: true,
      authenticated: true,
      service: 'NEHTW API',
      message: 'Conexão autenticada com a NEHTW.',
      sites: data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      configured: nehtwConfigured,
      authenticated: false,
      message: 'Erro na autenticação NEHTW.',
      error: error.message,
    });
  }
});

// ==========================================
// STOCK SITES
// ==========================================

app.get('/api/stocksites', async (req, res) => {
  try {
    const data = await nehtwRequest('/stocksites');

    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: 'Erro ao consultar sites.',
      error: error.message,
    });
  }
});

// ==========================================
// GET FILES INFORMATION
// ==========================================

app.get('/api/stockinfo', async (req, res) => {
  try {
    const { site, id, url } = req.query;

    if (!url && (!site || !id)) {
      return res.status(400).json({
        success: false,
        message: 'Informe URL ou site e ID.',
      });
    }

    // A NEHTW permite null para site e ID
    // quando a URL original é fornecida.

    const siteValue = site
      ? String(site)
      : 'null';

    const idValue = id
      ? String(id)
      : 'null';

    const params = new URLSearchParams();

    if (url) {
      params.set('url', String(url));
    }

    const endpoint =
      `/stockinfo/${encodeURIComponent(siteValue)}/${encodeURIComponent(idValue)}` +
      (params.toString()
        ? `?${params.toString()}`
        : '');

    console.log('');
    console.log('[GET FILES INFORMATION]');
    console.log('Site:', siteValue);
    console.log('ID:', idValue);
    console.log('URL:', url || 'Não informada');

    const data = await nehtwRequest(endpoint);

    if (data?.error || data?.success === false) {
      return res.status(422).json({
        success: false,
        message: 'A NEHTW não conseguiu identificar o arquivo.',
        response: data,
      });
    }

    console.log('[STOCKINFO] Arquivo consultado.');

    return res.json(data);

  } catch (error) {
    console.error('[STOCKINFO ERROR]', error.message);

    res.status(error.status || 500).json({
      success: false,
      message: 'Erro ao consultar informações do arquivo.',
      error: error.message,
      details: error.data || null,
    });
  }
});

// ==========================================
// STOCK ORDER - CRIAR DOWNLOAD
// ==========================================

app.get('/api/stockorder/:site/:id', async (req, res) => {
  try {
    const { site, id } = req.params;
    const { url } = req.query;

    if (!site || !id) {
      return res.status(400).json({
        success: false,
        message: 'Site e ID obrigatórios.',
      });
    }

    const normalizedSite = site.toLowerCase();

    if (
      ['pngtree', 'storyblocks'].includes(normalizedSite) &&
      !url
    ) {
      return res.status(400).json({
        success: false,
        message: 'URL original obrigatória para este site.',
      });
    }

    let endpoint =
      `/stockorder/${encodeURIComponent(site)}/${encodeURIComponent(id)}`;

    if (url) {
      endpoint += `?url=${encodeURIComponent(String(url))}`;
    }

    const data = await nehtwRequest(endpoint);

    if (!data?.success || !data?.task_id) {
      return res.status(502).json({
        success: false,
        message: 'A NEHTW não confirmou o pedido.',
        response: data,
      });
    }

    // Salvar pedido no MongoDB

    if (mongoose.connection.readyState === 1) {
      await Order.findOneAndUpdate(
        { taskId: String(data.task_id) },
        {
          $set: {
            taskId: String(data.task_id),
            site,
            fileId: id,
            sourceUrl: url ? String(url) : null,
            status: 'queued',
            response: data,
          },
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'Pedido enviado para processamento.',
      task_id: data.task_id,
      status: 'queued',
      response: data,
    });

  } catch (error) {
    console.error('[STOCKORDER ERROR]', error.message);

    res.status(error.status || 500).json({
      success: false,
      message: 'Erro ao criar pedido.',
      error: error.message,
      details: error.data || null,
    });
  }
});

// ==========================================
// STATUS DO DOWNLOAD
// ==========================================

app.get('/api/order/:taskId/status', async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID obrigatório.',
      });
    }

    const responseType = req.query.responsetype || 'any';

    const endpoint =
      `/order/${encodeURIComponent(taskId)}/status` +
      `?responsetype=${encodeURIComponent(responseType)}`;

    const data = await nehtwRequest(endpoint);

    const links = Array.isArray(data.available_download_links)
      ? data.available_download_links
      : [];

    if (mongoose.connection.readyState === 1) {
      await Order.findOneAndUpdate(
        { taskId: String(taskId) },
        {
          $set: {
            status: data.status || 'processing',
            response: data,
            downloadLinks: links,
          },
        }
      );
    }

    res.json({
      success: true,
      task_id: taskId,
      status: data.status || 'processing',
      available_download_links: links,
      original_source_link: data.original_source_link || null,
      response: data,
    });

  } catch (error) {
    console.error('[STATUS ERROR]', error.message);

    res.status(error.status || 500).json({
      success: false,
      message: 'Erro ao consultar processamento.',
      error: error.message,
    });
  }
});

// ==========================================
// CONSULTAR PEDIDO MONGODB
// ==========================================

app.get('/api/orders/:taskId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB não conectado.',
      });
    }

    const order = await Order.findOne({
      taskId: req.params.taskId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado.',
      });
    }

    res.json({
      success: true,
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// ENVIO DE EMAIL
// ==========================================

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!transporter) {
      return res.status(503).json({
        success: false,
        message: 'E-mail não configurado.',
      });
    }

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Preencha todos os campos.',
      });
    }

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
    });

    res.json({
      success: true,
      message: 'E-mail enviado.',
      messageId: result.messageId,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar e-mail.',
      error: error.message,
    });
  }
});

// ==========================================
// ROTAS INEXISTENTES
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada.',
    path: req.originalUrl,
  });
});

// ==========================================
// ERROS GLOBAIS
// ==========================================

app.use((error, req, res, next) => {
  console.error('[SERVER ERROR]', error);

  res.status(error.status || 500).json({
    success: false,
    message: 'Erro interno do servidor.',
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

async function startServer() {
  await connectMongoDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('================================');
    console.log('       SERVIDOR DESIGNI');
    console.log('================================');
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`NEHTW: ${NEHTW_URL}`);
    console.log('MongoDB:', mongoose.connection.readyState === 1 ? 'OK' : 'OFF');
    console.log('Cloudinary:', cloudinaryConfigured ? 'OK' : 'OFF');
    console.log('Email:', transporter ? 'OK' : 'OFF');
    console.log('JWT:', jwtConfigured ? 'OK' : 'OFF');
    console.log('Clerk:', clerkConfigured ? 'OK' : 'OFF');
    console.log('NEHTW:', nehtwConfigured ? 'OK' : 'OFF');
    console.log('================================');
    console.log('');
  });
}

startServer();
