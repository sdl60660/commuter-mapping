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
            </div>
            
            <div className="footer__section">
                <p><strong>Notes</strong></p>
            </div>

            <p>Last Updated: January 2021</p>
        </div>
    )
}

export { Footer as default }