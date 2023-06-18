import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import PropTypes from 'prop-types';

const DeleteButton = ({ onClick, label, popoverText, ...props }) => {
    const [isClickedOnce, setIsClickedOnce] = useState(false);
    const handleClick = useCallback((e) => {
        e.stopPropagation();
        if (isClickedOnce) {
            onClick();
        } else {
            setIsClickedOnce(true);
            setTimeout(() => {
                setIsClickedOnce(false);
            }, 2000);
        }
    }, [isClickedOnce, onClick]);

    return (
        <OverlayTrigger
            key={"delete-button-tooltip"}
            placement={"auto-end"}
            overlay={
                <Tooltip id={`tooltip-to-confirm-delete`}>
                    {popoverText ?? `Click twice to confirm the delete.`} ({isClickedOnce ? "1" : "0"}/2)
                </Tooltip>
            }
        >
            <Button {...props} size="sm" variant="outline-danger" onClick={handleClick}>
                <FontAwesomeIcon icon={faTrash} /> {label}
            </Button>
        </OverlayTrigger>
    );
}

DeleteButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string,
    popoverText: PropTypes.string,
};

export default DeleteButton;