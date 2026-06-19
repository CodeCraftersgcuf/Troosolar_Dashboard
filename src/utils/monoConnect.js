import MonoConnect from '@mono.co/connect.js';
import axios from 'axios';
import API from '../config/api.config';

export const cleanupMonoWidgetDom = () => {
    document.getElementById('mono-connect--widget-div')?.remove();
    document.querySelector('script[src*="connect.withmono.com"]')?.remove();
    delete window.Connect;
    delete window.MonoConnect;
};

export const patchMonoIframePermissions = () => {
    const iframe = document.getElementById('mono-connect--frame-id');
    if (!iframe) return;
    iframe.setAttribute(
        'allow',
        'camera *; microphone *; clipboard-write; clipboard-read; fullscreen'
    );
};

export const prepareCameraForMono = async () => {
    if (!window.isSecureContext) {
        throw new Error(
            'Camera access requires a secure connection. Use http://localhost:5176 (not the network IP) or the HTTPS production site.'
        );
    }
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Your browser does not support camera access. Please use Chrome or Edge.');
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
        });
        stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
        if (err?.name === 'NotAllowedError') {
            throw new Error(
                'Camera permission was blocked. Click the lock icon in your browser address bar, set Camera to Allow, then reload and try again.'
            );
        }
        if (err?.name === 'NotFoundError') {
            throw new Error('No camera was found on this device.');
        }
        if (err?.name === 'NotReadableError') {
            throw new Error('Camera is in use by another app. Close Zoom, Teams, or other camera apps and try again.');
        }
        throw err;
    }
};

export const fetchMonoPublicKey = async () => {
    const configResponse = await axios.get(API.CONFIG_MONO, {
        headers: { Accept: 'application/json' },
    });
    const monoPublicKey = configResponse.data?.data?.public_key || '';
    if (!monoPublicKey || monoPublicKey.length < 10) {
        throw new Error('Invalid Mono public key. Please configure MONO_PUBLIC_KEY on the backend.');
    }
    return monoPublicKey;
};

const MONO_ACCOUNT_PATHS = [API.USER_MONO_ACCOUNT, API.USER_MONO_ACCOUNT_ALT].filter(Boolean);
const MONO_ACCOUNT_LINK_PATHS = [API.USER_MONO_ACCOUNT_LINK, API.USER_MONO_ACCOUNT_LINK_ALT].filter(Boolean);

const isRouteNotFoundError = (err) => {
    const status = err?.response?.status;
    const message = String(err?.response?.data?.message || err?.message || '');
    return status === 404 || message.includes('could not be found');
};

const requestWithPathFallback = async (paths, requestFn) => {
    let lastError = null;
    for (const path of [...new Set(paths)]) {
        try {
            return await requestFn(path);
        } catch (err) {
            lastError = err;
            if (!isRouteNotFoundError(err)) {
                throw err;
            }
        }
    }
    const deployError = new Error(
        'Bank linking API is not deployed on the server yet. Please ask the admin to update the backend (git pull + migrate + clear route cache), then try again.'
    );
    deployError.cause = lastError;
    throw deployError;
};

export const fetchUserMonoAccount = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return { linked: false };
    }
    try {
        const response = await requestWithPathFallback(MONO_ACCOUNT_PATHS, (path) =>
            axios.get(path, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
        );
        return response.data?.data || { linked: false };
    } catch (err) {
        if (isRouteNotFoundError(err)) {
            return { linked: false, apiUnavailable: true };
        }
        throw err;
    }
};

/**
 * Open Mono Connect widget for bank linking.
 * @param {object} options
 * @param {string} options.customerName
 * @param {string} options.customerEmail
 * @param {string} [options.referencePrefix]
 * @param {function} options.onSuccess - called with widget payload containing code
 * @param {function} [options.onClose]
 * @param {object} [options.existingInstance] - previous MonoConnect instance to close
 * @param {function} [options.onInstance] - receives new MonoConnect instance
 * @param {boolean} [options.prepareCamera]
 */
export const openMonoConnectWidget = async ({
    customerName = '',
    customerEmail = '',
    referencePrefix = 'troosolar',
    onSuccess,
    onClose,
    existingInstance,
    onInstance,
    prepareCamera = false,
}) => {
    cleanupMonoWidgetDom();
    if (prepareCamera) {
        await prepareCameraForMono();
    }

    const monoPublicKey = await fetchMonoPublicKey();

    if (existingInstance?.close) {
        try {
            existingInstance.close();
        } catch (_) {
            // ignore
        }
    }

    const monoConnect = new MonoConnect({
        key: monoPublicKey,
        scope: 'auth',
        reference: `${referencePrefix}_${Date.now()}`,
        data: {
            customer: {
                name: customerName,
                email: customerEmail,
            },
        },
        onSuccess,
        onClose: onClose || (() => {}),
        onEvent: (eventName, data) => {
            if (eventName === 'ERROR') {
                console.error('Mono Connect widget error:', data);
            }
        },
    });

    onInstance?.(monoConnect);
    monoConnect.setup();
    patchMonoIframePermissions();
    monoConnect.open();
    setTimeout(patchMonoIframePermissions, 500);
    setTimeout(patchMonoIframePermissions, 2500);

    return monoConnect;
};

export const linkMonoAccountFromCode = async (monoCode) => {
    const token = localStorage.getItem('access_token');
    const response = await requestWithPathFallback(MONO_ACCOUNT_LINK_PATHS, (path) =>
        axios.post(
            path,
            { mono_code: monoCode },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        )
    );
    return response.data?.data;
};
