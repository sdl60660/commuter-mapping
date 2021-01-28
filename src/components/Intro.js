import React from 'react';


const Intro = (props) => {
    return (
        <div className={"intro-container"}>
            <div className={"intro-container__row"} id={"title-row"}>
                <h1 className="intro-container__title">Defining Metro Area Commuter Patterns</h1>
            </div>
            <div className={"intro-container__row"}>
                This is a draft project. It uses LODES (LEHD Origin-Destination Employment Statsitics) data from the U.S. Census to better understand and visualize 
                commuting patterns in metropolitan areas and to better define urban, suburban, exurban and rural boundaries.
            </div>
        </div>
    )
}

export { Intro as default }