import React from 'react';


const Intro = (props) => {
    return (
        <div className={"intro-container"}>
            <div className={"intro-container__row"} id={"title-row"}>
                <h1 className="intro-container__title">Title Here</h1>
            </div>
            <div className={"intro-container__row"}>
                Intro Here
            </div>
        </div>
    )
}

export { Intro as default }