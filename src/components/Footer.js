import React from 'react';


const Footer = ({ githubLink = ""  }) => {
    return (
        <div className={"footer"}>
        <hr />
            <div className="footer__section">
                <p><strong>Visualization by <a target="_blank" href="https://www.samlearner.com">Sam Learner</a></strong> |&nbsp;
                    <a target="_blank" href="mailto:learnersd@gmail.com"><img className="icon-img" src="/images/email.svg" /></a> |&nbsp;
                    <a target="_blank" href="https://twitter.com/sam_learner"><img className="icon-img" src="/images/twitter.svg" /></a> |&nbsp;
                    <a target="_blank" href="https://github.com/sdl60660"><img className="icon-img" src="/images/github.png" /></a>
                </p>
                <p>Code and data for this project lives <a target="_blank" href={githubLink}>here</a>.</p> 
            </div>

            <div className="footer__section">
                <p><strong>Sources</strong></p>
                <p>All LODES commuter data comes from the U.S. census, via the <a href="https://github.com/jamgreen/lehdr">lehdr tool</a>. Municipal boundaries and population data comes from the U.S. Census as well. Vote totals from the 2020 election come from the New York Times.</p>
            </div>
            
            <div className="footer__section">
                <p><strong>Notes</strong></p>
                <p>Metropolitan areas with at least 250,000 people are included, with the exception of Anchorange, AK because U.S. Census LODES commuter data is not available for Alaska.</p>
            </div>

            <p>Last Updated: January 2021</p>
        </div>
    )
}

export { Footer as default }