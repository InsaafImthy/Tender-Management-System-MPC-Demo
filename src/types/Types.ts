import type { ReactNode } from "react";

export interface ITextFieldProp {
    id?: string;
    value?: string | number;
    setValue?: (p: any) => void;
    onFocus?: () => void;
    placeholder?: string;
    disablePrevDates?: boolean;
    field?: string;
    width?: string; // You can pass custom Tailwind width classes (e.g., `w-64`)
    title?: "" | string;
    type?: "text" | "password" | "textarea" | "number" | "date";
    eye?: boolean;
    style?: string; // Tailwind custom classes
    disabled?: boolean;
    maxLength?: number;
    onKeyDown?: () => void
    step?: boolean,
    required?:boolean
}

export interface ILogin {
    username: string;
    password: string;
}

export interface NavItem {
    to?: string;
    title: string;
    icon: React.ElementType;
    noHover?: boolean; // Add noHover here
    onClick?: () => void;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    content: ReactNode; // Accept any React component or JSX
    height?: string;
    width?: string;
    modalPosition?: string;
    contentPosition?: string;
    CloseButton?: boolean;
}

export interface IUser {
    id?: string;
    createdAt?: string; // ISO date string
    createdBy?: string | null;
    updatedAt?: string; // ISO date string
    updatedBy?: string | null;
    clientId?: string;
    profilePhoto: string | null;
    userName: string;
    name: string;
    email: string;
    phone: string;
    password: string; // Encrypted password string
    roleId: string;
    roleName?: string;
    departmentId: string;
    departmentName?: string;
    gender: "male" | "female" | "other"; // Can add more options if applicable
    place: string;
    isActive: boolean;
}

