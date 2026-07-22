<h1>🔐 TOTP-Based Two-Factor Authentication (2FA) Research</h1>

<h2>📌 Overview</h2>
<p>
This document summarizes the evaluation of two popular Node.js libraries,
<strong>Speakeasy</strong> and <strong>otplib</strong>, for implementing
Time-Based One-Time Password (TOTP) based Two-Factor Authentication (2FA)
in a NestJS application.
</p>

<hr>

<h2>1️⃣ Speakeasy</h2>

<h3>Description</h3>
<p>
Speakeasy is a Node.js library used to generate and verify HOTP and TOTP
authentication codes. It has been widely used for implementing Google
Authenticator-based 2FA solutions.
</p>

<h3>Features</h3>
<ul>
  <li>✅ TOTP Support</li>
  <li>✅ HOTP Support</li>
  <li>✅ Secret Generation</li>
  <li>✅ OTP Verification</li>
  <li>✅ Google Authenticator Compatibility</li>
</ul>

<h3>Example</h3>

<pre><code>
import * as speakeasy from 'speakeasy';

const secret = speakeasy.generateSecret();

const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: '123456',
});
</code></pre>

<h3>Advantages</h3>
<ul>
  <li>Stable and mature library</li>
  <li>Easy to implement</li>
  <li>Supports both HOTP and TOTP</li>
</ul>

<h3>Limitations</h3>
<ul>
  <li>Less active maintenance</li>
  <li>Older API design</li>
  <li>Limited TypeScript support</li>
</ul>

<hr>

<h2>2️⃣ otplib</h2>

<h3>Description</h3>
<p>
otplib is a modern OTP library for Node.js that supports TOTP and HOTP
authentication. It offers better TypeScript support, cleaner APIs, and
excellent integration with NestJS applications.
</p>

<h3>Features</h3>
<ul>
  <li>✅ TOTP Support</li>
  <li>✅ HOTP Support</li>
  <li>✅ Built-in Authenticator Module</li>
  <li>✅ Google Authenticator Compatibility</li>
  <li>✅ TypeScript Friendly</li>
  <li>✅ Actively Maintained</li>
</ul>

<h3>Example</h3>

<pre><code>
import { authenticator } from 'otplib';

const secret = authenticator.generateSecret();

const verified = authenticator.verify({
  token: '123456',
  secret,
});
</code></pre>

<h3>Advantages</h3>
<ul>
  <li>Modern and clean API</li>
  <li>Better TypeScript support</li>
  <li>Actively maintained</li>
  <li>Excellent NestJS integration</li>
  <li>Simplified authenticator workflow</li>
</ul>

<h3>Limitations</h3>
<ul>
  <li>Different API compared to older tutorials</li>
</ul>

<hr>

<h2>📊 Library Comparison</h2>

<table border="1" cellpadding="8" cellspacing="0">
  <tr>
    <th>Feature</th>
    <th>Speakeasy</th>
    <th>otplib</th>
  </tr>
  <tr>
    <td>TOTP Support</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>HOTP Support</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>TypeScript Support</td>
    <td>Basic</td>
    <td>Better</td>
  </tr>
  <tr>
    <td>Active Maintenance</td>
    <td>Less Active</td>
    <td>More Active</td>
  </tr>
  <tr>
    <td>Modern API</td>
    <td>Older Style</td>
    <td>Cleaner API</td>
  </tr>
  <tr>
    <td>NestJS Integration</td>
    <td>Good</td>
    <td>Excellent</td>
  </tr>
  <tr>
    <td>Authenticator Helpers</td>
    <td>Limited</td>
    <td>Built-in</td>
  </tr>
</table>

<hr>

<h2>✅ Selected Library: otplib</h2>

<h3>Reason for Selection</h3>

<ul>
  <li>Better TypeScript support for NestJS applications</li>
  <li>Cleaner and more maintainable API</li>
  <li>More actively maintained</li>
  <li>Built-in authenticator functionality</li>
  <li>Better long-term scalability and support</li>
</ul>

<hr>

<h2>🔄 2FA Workflow Using otplib + qrcode</h2>

<pre>
User
  │
  ▼
Enable 2FA
  │
  ▼
Generate Secret (otplib)
  │
  ▼
Create otpauth URL
  │
  ▼
Generate QR Code (qrcode)
  │
  ▼
Scan Using Authenticator App
  │
  ▼
Store Secret on Device
  │
  ▼
Generate OTP Every 30 Seconds
  │
  ▼
Login Request
  │
  ▼
Verify OTP (otplib)
  │
  ▼
Generate JWT Token
  │
  ▼
Access Granted
</pre>

<hr>

<h2>🎯 Conclusion</h2>

<p>
After evaluating both libraries, <strong>otplib</strong> was selected for
implementing TOTP-based Two-Factor Authentication (2FA) in the NestJS
backend. The library provides better TypeScript support, a cleaner API,
active maintenance, and excellent compatibility with modern NestJS
applications. The <strong>qrcode</strong> package is used alongside otplib
to generate QR codes that allow users to quickly configure authenticator
applications such as Google Authenticator and Microsoft Authenticator.
</p>
