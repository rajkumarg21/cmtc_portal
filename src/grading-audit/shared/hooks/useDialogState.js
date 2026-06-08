import { useState } from "react";

const useDialogState = () => {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [readOnly, setReadOnly] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const openDialog = (item, options = {}) => {
        setSelectedItem(item);
        setReadOnly(options.readOnly || false);
        setIsSubmitted(options.isSubmitted || false);
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
        setSelectedItem(null);
    };

    return {
        open,
        selectedItem,
        readOnly,
        isSubmitted,
        openDialog,
        closeDialog,
    };
};

export default useDialogState;