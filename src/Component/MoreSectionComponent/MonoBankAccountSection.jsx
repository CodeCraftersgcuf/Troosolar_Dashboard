import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import {
    fetchUserMonoAccount,
    linkMonoAccountFromCode,
    openMonoConnectWidget,
} from '../../utils/monoConnect';

const getLocalUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
};

const MonoBankAccountSection = () => {
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);
    const [account, setAccount] = useState({ linked: false });
    const [monoInstance, setMonoInstance] = useState(null);

    const loadAccount = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchUserMonoAccount();
            setAccount(data);
        } catch (err) {
            console.error('Failed to load Mono account status', err);
            setAccount({ linked: false });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccount();
    }, [loadAccount]);

    const handleMonoSuccess = async (payload) => {
        const code = typeof payload === 'string' ? payload : (payload?.code || payload?.auth_code);
        if (!code) {
            toast.error('Mono did not return an authorization code.');
            setLinking(false);
            return;
        }

        try {
            const linked = await linkMonoAccountFromCode(code);
            setAccount({
                linked: true,
                bank_label: linked?.bank_label,
                mono_account_id: linked?.mono_account_id,
                linked_at: linked?.linked_at,
            });
            toast.success(account.linked ? 'Bank account updated successfully' : 'Bank account connected successfully');
        } catch (err) {
            console.error('Mono link error', err);
            toast.error(err?.response?.data?.message || err.message || 'Failed to link bank account');
        } finally {
            setLinking(false);
        }
    };

    const handleConnect = async () => {
        const user = getLocalUser();
        const customerName = [user?.first_name, user?.surname || user?.last_name].filter(Boolean).join(' ')
            || user?.name
            || user?.full_name
            || '';
        const customerEmail = user?.email || '';

        setLinking(true);
        try {
            await openMonoConnectWidget({
                customerName,
                customerEmail,
                referencePrefix: 'troosolar_profile',
                existingInstance: monoInstance,
                onInstance: setMonoInstance,
                onSuccess: handleMonoSuccess,
                onClose: () => setLinking(false),
                prepareCamera: true,
            });
        } catch (err) {
            console.error('Mono Connect init error', err);
            toast.error(err.message || 'Failed to open bank connection');
            setLinking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="animate-spin mr-2" size={20} />
                Loading bank account...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-50 p-2 text-[#273e8e]">
                        <Building2 size={22} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800">Mono bank account</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Connect your bank once here. BNPL credit checks will use this account automatically.
                            You can change your bank anytime.
                        </p>
                    </div>
                </div>

                {account.linked ? (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center gap-2 text-green-800 font-medium">
                            <CheckCircle size={18} />
                            <span>Bank account connected</span>
                        </div>
                        <p className="text-sm text-green-700 mt-2">
                            {account.bank_label || 'Your bank is linked via Mono'}
                        </p>
                        {account.linked_at && (
                            <p className="text-xs text-green-600 mt-1">
                                Linked {new Date(account.linked_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm text-amber-800">
                            No bank account connected yet. Link your account to speed up BNPL applications.
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleConnect}
                    disabled={linking}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-[#273e8e] text-white text-sm py-4 rounded-full disabled:opacity-60"
                >
                    {linking ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Opening Mono...
                        </>
                    ) : account.linked ? (
                        <>
                            <RefreshCw size={18} />
                            Change bank account
                        </>
                    ) : (
                        'Connect bank account'
                    )}
                </button>
            </div>
        </div>
    );
};

export default MonoBankAccountSection;
