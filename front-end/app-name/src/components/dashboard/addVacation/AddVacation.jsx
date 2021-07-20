import React, {useState, useEffect} from 'react';
import './AddVacation.css';
import './AddVacationQueries.css';
import {IoAirplane} from "react-icons/io5";
import AddMoal from '../addModal/AddMoal';

const AddVacation = () => {
    const [addMoalState, setAddModalState] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertStyle, setAlertStyle] = useState('');

    useEffect(() => {
      const clearSuccess =  setTimeout(() => {
        setAlertContent(false);
        }, 5000);
        return () => clearTimeout(clearSuccess);
    }, [alertContent]);

    const addVacation = () => { setAddModalState(true); }
    
    return(
        <>
            <div className='add-vacation-container'>
                <div className='add-header'>
                    <i><IoAirplane /></i>
                    <h1>Add Vacation</h1>
                    <p>Add a new vacation for your clients.</p>
                </div>
                <div className='add-button-box'>
                    <button onClick={addVacation}>Add Vacation</button>
                </div>

                {alertContent? 
                <>
                    <div className='msg-box'>
                        <p className={alertStyle}>{alertContent}</p>
                    </div>
                </> : null }
            </div>

            {addMoalState ?
            <AddMoal 
                setAddModalState={setAddModalState} 
                setAlertContent={setAlertContent}
                setAlertStyle={setAlertStyle}
            /> : null}
        </>
    );
}

export default AddVacation;