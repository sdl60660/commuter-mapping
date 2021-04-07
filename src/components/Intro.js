import React from 'react';


const Intro = (props) => {
    return (
        <div className={"intro-container"}>
            <div className={"intro-container__row"} id={"title-row"}>
                <h1 className="intro-container__title">Exploring Metro Commuter Patterns</h1>
            </div>
            <div className={"intro-container__row"}>
                <p>
                    This is a draft project. It uses LODES (LEHD Origin-Destination Employment Statsitics) data from the U.S. Census to better understand and visualize 
                    commuting patterns in metropolitan areas and to better define urban, suburban, exurban and rural boundaries.
                </p>
                <p>
                    Use the map below to find percentages of commuters in any given metropolitan area to the area's largest city, outside of the area's largest city, and outside of the full metro area. The chart below that allows comparison 
                    between all metro areas with at least 250,000 people.
                </p>
            </div>
        </div>
    )
}

export { Intro as default }