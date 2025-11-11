
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-10" onClick={onClose}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 p-5 rounded-lg z-20 w-11/12 max-w-md shadow-lg">
                <h3 className="text-center mt-0 text-lg sm:text-xl font-bold">{title}</h3>
                {children}
            </div>
        </>
    );
};

export default Modal;
