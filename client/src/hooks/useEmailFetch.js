import { useState, useEffect, useRef, useCallback } from 'react';
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
  const prevEmailsCountRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchEmails = useCallback(async (silent = false) => {
    if (!user || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    
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
        if (prevEmailsCountRef.current > 0 && newEmails.length > prevEmailsCountRef.current) {
          const newEmailCount = newEmails.length - prevEmailsCountRef.current;
          if (newEmailCount > 0 && !silent) {
            toast.success(`${newEmailCount} new email${newEmailCount > 1 ? 's' : ''} received!`, {
              duration: 3000,
            });
          }
        }
        
        prevEmailsCountRef.current = newEmails.length;
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
      isFetchingRef.current = false;
    }
  }, [user, mailbox]);

  const debouncedRefresh = useCallback((silent = false) => {
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => {
      fetchEmails(silent);
    }, 300);
  }, [fetchEmails]);

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

    // Clear any existing intervals/timeouts
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    
    // Reset fetching flag
    isFetchingRef.current = false;

    // Initial load with delay to avoid race conditions
    const initialTimeout = setTimeout(() => {
      if (isMountedRef.current && !isFetchingRef.current) {
        fetchEmails(true);
      }
    }, 500);

    // Set up periodic refresh
    refreshIntervalRef.current = setInterval(() => {
      if (isMountedRef.current && document.visibilityState === 'visible' && !isFetchingRef.current) {
        debouncedRefresh(true);
      }
    }, refreshInterval);

    // Listen for token changes
    const unsubscribe = auth.onIdTokenChanged((u) => {
      if (u && isMountedRef.current && !isFetchingRef.current) {
        // Silent refresh to avoid jarring loaders during route transitions
        debouncedRefresh(true);
      }
    });

    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMountedRef.current && !isFetchingRef.current) {
        debouncedRefresh(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialTimeout);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      unsubscribe?.();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      isMountedRef.current = false;
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
