import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getAuth } from 'firebase/auth';
import { showEmailLists } from '../apiRequests/showEmailLists';
import toast from 'react-hot-toast';

export const useEmailFetch = (mailbox = 'inbox', refreshInterval = 30000) => {
  const [emails, setEmails] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const { user } = useSelector((state) => state.auth);
  
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  const fetchEmails = async (silent = false) => {
    if (!user) return;
    
    try {
      if (!silent) setIsLoadingEmails(true);
      
      // Clear any pending fetch to prevent duplicate requests
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      
      const list = await showEmailLists(mailbox);
      
      if (isMountedRef.current) {
        const newEmails = Array.isArray(list) ? list : [];
        
        // Check for new emails (compare with previous state)
        if (emails.length > 0 && newEmails.length > emails.length) {
          const newEmailCount = newEmails.length - emails.length;
          if (newEmailCount > 0 && !silent) {
            toast.success(`${newEmailCount} new email${newEmailCount > 1 ? 's' : ''} received!`, {
              duration: 3000,
            });
          }
        }
        
        setEmails(newEmails);
      }
    } catch (e) {
      console.error(`${mailbox} emails fetch error:`, e);
      if (isMountedRef.current && !silent) {
        toast.error(`Failed to load ${mailbox} emails`);
      }
    } finally {
      if (isMountedRef.current && !silent) {
        setIsLoadingEmails(false);
      }
    }
  };

  const debouncedRefresh = (silent = false) => {
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => {
      fetchEmails(silent);
    }, 300);
  };

  const updateEmail = (emailId, updates) => {
    setEmails(prev => prev.map(email => 
      email._id === emailId ? { ...email, ...updates } : email
    ));
  };

  const removeEmail = (emailId) => {
    setEmails(prev => prev.filter(email => email._id !== emailId));
  };

  const addEmail = (newEmail) => {
    setEmails(prev => [newEmail, ...prev]);
  };

  useEffect(() => {
    if (!user) return;

    isMountedRef.current = true;
    const auth = getAuth();

    // Initial load
    fetchEmails(true);

    // Set up periodic refresh
    refreshIntervalRef.current = setInterval(() => {
      if (isMountedRef.current && document.visibilityState === 'visible') {
        debouncedRefresh(true);
      }
    }, refreshInterval);

    // Listen for token changes
    const unsubscribe = auth.onIdTokenChanged((u) => {
      if (u && isMountedRef.current) {
        debouncedRefresh(false);
      }
    });

    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        debouncedRefresh(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      unsubscribe?.();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, mailbox]);

  return {
    emails,
    isLoadingEmails,
    fetchEmails: debouncedRefresh,
    updateEmail,
    removeEmail,
    addEmail
  };
};
