import react, { useEffect, useState } from "react"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/about.css";
import about_us from  "../images/about_us.png";
import preschool from  "../images/preschool.png";
import morning from  "../images/morning.png";
import team from  "../images/ourteam.png";
{/* TODO: Insert redirection link to "our team" page */}
{/* TODO: Images of Preschool and Morning Garden resize for smaller screens, 
        but it stays a certain size after a point and does not resize further */}
// vercel please update 

function About() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 769 ? true : false); 

    useEffect(() => { 
        function handleResize() { 
          setIsMobile(window.innerWidth < 769 ? true : false); 
        } 

        window.addEventListener('resize', handleResize); 
    }); 

    return (
    <div>
        <div class="container-fluid p-0">
            {/* Added <br>'s occasionally to add space between text while on small screens */}
            {/* classname abttxt gave margins to a bunch of text */}

            {/* Display About Us text left with an Image on right */} 
            <div className="container-padding">
                <h1 className="header-text">About Us</h1>
                <div className="row no-gutters">
                    <div className="col-lg-6 side-info infoblurb" style={{padding: "0"}}> 
                    Hands Together has been recognized at a state and national level for preparing young children for kindergarten. 
                    <br/><br/>We offer advanced early education to over 95 at risk children each day. 
                    <br/><br/>We do more than preschool preparation–the facility  works with working poor parents to enrich their lives, preparing them for the work place. 
                    </div> 
                    <div className="col-lg-6 img-container" style={{padding: "0"}}>
                        <img src={about_us} className="about-img"/>
                    </div>
                </div>
            </div> 

            {/* Display Programs followed by Preschool and Morning Garden divs */}

            <div class="container-fluid p-3">
                <h1 align="center" className="our-programs">Our Programs</h1> 
            </div>
            
            <div className="vertical_space" />
            <div class="container-fluid p-0">
                <div class="row align-items-center preschoolFormat">
                    <div class="col-md-5 centerImg" > 
                        <img class="imgFormat" src={preschool}/>
                    </div>

                    <div class="col-1" />
                    <div class="col-md-6"> 
                    <br /> <br />
                        <h2 className = "smallScreenTextShift">Preschool</h2>
                        <div className = "smallScreenTextShift infoblurb"> Hands Together is a licensed, award-winning preschool and childcare program serving children ages 6 weeks to 5 years. 
                            Our preschool is designed to meet the academic and social needs of the predominantly Latino community in Santa Ana, 
                            and our goal is to prepare every student for successful entry into kindergarten.<br /><br /></div>
                        <button onClick={() => (window.location = "/programs")} className="sm-button" style={{backgroundColor: "var(--darkyellow)"}}> 
                            Learn More
                        </button>                        
                        <br /> <br /> <br /> <br />
                    </div>
                    <div class="col-1" />
                    
                </div>
            </div>

            <div class="container-fluid p-0">
                <div class="row align-items-center morningFormat">
                    {isMobile ? 
                    <>
                        <div class="col-md-5" > 
                            <img class = "imgFormat" src={morning}/>
                        </div>
                        <div class="col-1" />
                        <div class="col-md-6"> 
                        <br /><br />
                            <h2 className="smallScreenTextShift">Morning Garden</h2>
                            <div className="smallScreenTextShift infoblurb">The Morning Garden is a unique preschool and workforce development program for housing-insecure families and families in transition. 
                                We offer developmentally appropriate, structured activities that help young children learn how to play well together, share resources, 
                                and respect others.<br /><br /></div>
                            <button onClick={() => (window.location = "/programs")} className="sm-button" style={{backgroundColor: "var(--lightblue)"}}> 
                                Learn More
                            </button> 
                            <br /> <br /> <br /> <br />
                        </div>
                        <div class="col-1" />
                    </>
                    :
                    <>
                        <div class="col-md-6"> 
                        <br /><br />
                            <h2 className="smallScreenTextShift">Morning Garden</h2>
                            <div className="smallScreenTextShift infoblurb">The Morning Garden is a unique preschool and workforce development program for housing-insecure families and families in transition. 
                                We offer developmentally appropriate, structured activities that help young children learn how to play well together, share resources, 
                                and respect others.<br /><br /></div>
                                <button onClick={() => (window.location = "/programs")} className="sm-button" style={{backgroundColor: "var(--lightblue)"}}> 
                                    Learn More
                                </button> 
                                <br /> <br /> <br /> <br />
                        </div>
                        <div class="col-1" />
                        <div class="col-md-5" > 
                            <img class = "imgFormat" src={morning}/>
                        </div>
                        <div class="col-1" />
                    </>
                    }
                </div>
            </div>
            {/* Our Team Link */}
            
            <div class="container-fluid p-0" >
                <div class="row no-gutters">
                    <div className="container-light" style={{opacity: 0.5}}>
                    </div>
                    <div class="col-4 col-md-4"/>
                    <div class="col-4 col-md-4" align="center">
                        <h1 className="team" onClick={() => (window.location = "/our_team")}>Meet Our Team</h1>        
                    </div>     
                    <div class="col-4 col-md-4"/>
                </div>     
            </div> 
        </div> 
    </div>
        
    );
}

export default About;
