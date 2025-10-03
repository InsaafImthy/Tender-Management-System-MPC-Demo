import axios from "axios";
import { currencies, currenciesWithLabel } from "./constants";
import Cookies from "js-cookie";

export const getUserToken = (): string => {
    let token = Cookies.get("token");
    return token ? token : "";
}

export const convertCurrencyLabel = (currencyType: string) => {
    const type = currencies.find(x => x.value === currencyType);
    return type?.label;
}

export const convertCurrencyWithLabel = (currencyType: string) => {
    const type = currenciesWithLabel.find(x => x.value === currencyType);
    return type?.label;
}

export function vendorStatusConverter(code: 0 | 1 | 2): string {
    switch (code) {
        case 0:
            return "pending";
        case 1:
            return "approved";
        case 2:
            return "rejected";
        default:
            return "unknown"; // fallback for unexpected codes
    }
}

export const formatDate = (date: string): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Handle invalid dates

    // Format the date to "yyyy-MM-dd"
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const parseJwt = (token: string) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export const convertToAmPm = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);

    // Options for formatting time to 12-hour format with AM/PM
    const options: any = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    return date.toLocaleTimeString([], options);
};

export const getUserCredentials = (): { userId: string, roleId: string, name: string, departmentId: string, companyId: string, role: string } => {
    const [userId, roleId, name, departmentId, companyId, role] = [Cookies.get("userId") as string, Cookies.get("roleId") as string, Cookies.get("name") as string, Cookies.get("departmentId") as string, Cookies.get("companyId") as string, Cookies.get("role") as string]
    return { userId, roleId, name, departmentId, companyId, role }
}


export const fetchAndConvertToFile = async (
    fileUrl: string,
    originalFileName: string
): Promise<{ document: File; documentName: string }> => {
    try {
        console.log("Fetching file from:", fileUrl);

        const response = await axios.get(fileUrl, {
            responseType: "blob",
            withCredentials: true,
        });

        console.log("Blob fetched successfully");

        const blob = response.data;

        // ✅ Use the provided filename instead of extracting from the URL
        const file = new File([blob], originalFileName, { type: blob.type });

        return { document: file, documentName: originalFileName };
    } catch (error) {
        console.error("Error in fetchAndConvertToFile:", error);
        throw new Error("Something went wrong during file fetch.");
    }
};


export const getUserInitials = (name: string): string => {
    if (!name) return "U";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase(); // Only first letter
};

export const getKeyByValue = (obj: any, value: number) => {
    return Object.keys(obj).find(key => obj[key] === value);
};

export async function ensureNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
        return Notification.permission;
    }
    // Prefer calling this from a user-initiated click handler
    return await Notification.requestPermission();
}

export function showNotification(
    title: string,
    options?: NotificationOptions & { clickUrl?: string; },
    force: boolean = false
) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // Optional: only show native notification if app not focused
    const shouldNotify = force || document.hidden || !document.hasFocus();

    if (shouldNotify) {
        const n = new Notification(title, options);
        n.onclick = () => {
            // Bring the tab to front and optionally navigate
            window.focus();
            if (options?.clickUrl) window.location.assign(options.clickUrl);
            n.close();
        };

        setTimeout(() => n.close(), 5000);
    } else {
        // App is focused; consider showing an in-app toast/snackbar instead
        // e.g., enqueueSnackbar(options.body) or your custom toast
    }
}