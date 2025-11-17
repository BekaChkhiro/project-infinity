import toast from 'react-hot-toast';

// Georgian toast messages
export const toastMessages = {
  project: {
    created: 'პროექტი წარმატებით შეიქმნა',
    updated: 'პროექტი წარმატებით განახლდა',
    deleted: 'პროექტი წარმატებით წაიშალა',
    archived: 'პროექტი დაარქივდა',
    stageChanged: 'ეტაპი წარმატებით შეიცვალა',
    error: 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან',
  },
  client: {
    created: 'კლიენტი წარმატებით შეიქმნა',
    updated: 'კლიენტი წარმატებით განახლდა',
    deleted: 'კლიენტი წარმატებით წაიშალა',
    error: 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან',
  },
  generic: {
    success: 'ოპერაცია წარმატებით შესრულდა',
    error: 'დაფიქსირდა შეცდომა',
    loading: 'გთხოვთ დაელოდოთ...',
  },
};

// Toast helper functions
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    });
  },
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
      }
    );
  },
};
