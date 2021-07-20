import React, {useState, useEffect} from 'react';
import './ChartJs.css';
import './ChartJsQueries.css';
import {Bar} from 'react-chartjs-2';
import NoData from '../noData/NoData';

const ChartJs = () => {
    const [arr, setArr] = useState([]);
    const [noDataHandler, setNoDataHandler ] = useState(false);
    const [loaderState, setLoaderState] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoaderState(true);
                const data = await fetch('http://localhost:3001/analytics');
                const res = await data.json();
                if (Array.isArray(res.vacation) && res.vacation.length > 0) {
                    setArr(res.vacation);
                    setNoDataHandler(false);
                    setLoaderState(false);
                } else {
                    console.error(res);
                    setNoDataHandler(true);
                    setLoaderState(false);
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    return (
        <>
            {arr.length > 0 && 
            <div className='analytics-chart'>
                <Bar
                    data={{
                        labels: arr.map(vacation => {return vacation.destination}),
                        datasets: [{
                            label: ['Followers'], 
                            data: arr.map(vacation => {return vacation.users.length}),
                            barThickness: 30,
                            maxBarThickness: 35,
                            borderWidth: 1,
                            borderColor: ['#606efe'],
                            backgroundColor: ['rgba(96, 110, 254, 0.4)']
                        }]
                    }}
                    options={{ 
                        maintainAspectRatio: false,
                        scales: { 
                            y: { 
                                beginAtZero: true,
                                ticks: { stepSize: 1 },
                            }
                        },
                        title:{ display: false },
                        legend:{ display: false },
                    }}
                    width={300}
                    height={400} 
                />
            </div>}

            {loaderState ?
                <div className='loader-dashboard'></div>
            : null }

            {noDataHandler && <NoData />}
        </>
    );
}

export default ChartJs;