import react, { useEffect, useState } from "react"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/history.css";
import img1 from "../images/Rectangle_40.png";
import img2 from "../images/programs_2.png";
import img3 from "../images/programs_3.png";
import img4 from "../images/programs_4.png";
import img5 from "../images/programs_5.png";
import img6 from "../images/programs_6.png";
import img7 from "../images/programs_7.png";

function History() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769 ? true : false); 

  useEffect(() => { 
      function handleResize() { 
        setIsMobile(window.innerWidth < 769 ? true : false); 
      } 

      window.addEventListener('resize', handleResize); 
  }); 

  return(
    <div>
      <div className="container-fluid p-0">
        <div className="container-padding">
          <h1 className="header-text">Our History, Goals, and Mission</h1>
            <div className="row no-gutters">
                <div className="col-lg-6 side-info infoblurb" style={{padding: "0"}}> 
                Founded in 1999, the mission of Hands Together is to provide the highest quality early education and care to families of the working poor who are striving to gain stability, improve their lives, and emerge from poverty. The goal is to prepare children to enter school with a quality early education. Noted for its comprehensive multi-faceted curriculum, this licensed program includes parenting, literacy, and health and developmental screening, in addition to child care. Primarily curriculum goals focus upon cognitive skills, and language, physical, social/emotional and aesthetic development. Additional components include: enriched English literacy, extended family support, and continuing professional development of teachers and operations staff. 
                </div> 
                <div className="col-lg-6 img-container" style={{padding: "0"}}>
                    <img src={img1} className="about-img"/>
                </div>
            </div>
        </div>
        
        <div className="container-padding" style={{marginTop: "4rem", marginBottom: "4rem"}}> 
          <div className="row no-gutters">
              <div className="col-lg-6 side-info infoblurb" style={{padding: "0"}}>
                <h1 className="header-text">Our Achievements</h1>
                In December, 2004, Hands Together was selected by the California Commission on Children and Families as one of only 10 exemplary childcare and early education program sites in the State. Earlier, Hands Together (although not a United way agency) was selected to work with United Way's esteemed "Success by Six" literacty program. It has also been recognized by the Children and Families Commission of Orange County as a distinguished grantee for its exemplary services to families in conjunction with a major Proposition 10 grant received in 2000. In addition, Hands Together has received national recognition from the U.S. Department of Housing and Urban Development as one of the most outstanding Empowerment Zone projects in the nation. 
                </div> 
              <div className="col-lg-6 img-container" style={{padding: "0"}}>
                  <img src={img3} className="about-img"/>
              </div>
          </div>
        </div> 
      </div>
    </div>
  );
}

export default History;