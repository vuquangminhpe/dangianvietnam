import logoImage from "../../assets/Giao dien home-06.png";
import bgFooter from "../../assets/Img_category/Giao dien home-01.png";

const Footer = () => {
  return (
    <footer
      className="w-full text-gray-300 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgFooter})` }}
    >
      <div className="px-6 pt-8 md:px-16 lg:px-36 w-full relative ">
        <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-10">
          <div className="flex-1 flex items-start">
            <img
              src={logoImage}
              alt="Dân Gian Việt Nam Logo"
              className="h-[200px] w-auto"
              style={{ margin: 0, padding: 0, border: 0 }}
            />
          </div>
          <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
            <div>
              <h2 className="font-semibold mb-5">Company</h2>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="/" className="hover:underline">Home</a>
                </li>
                
              </ul>
            </div>
            <div>
              
              <h2 className="font-semibold mb-5">Dan Gian Viet Nam</h2>
              <div className="text-sm space-y-2">
                <p>Sdt: 0356055320</p>
                <p>
                  <a
                    href="mailto:vietnamdangian@gmail.com"
                    className="hover:underline"
                  >
                    Gmail: vietnamdangian@gmail.com
                  </a>
                </p>
                <p>
                  <a
                    href="https://www.facebook.com/profile.php?id=61581296564675"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Facebook
                  </a>
                </p>
              </div>
              {/* KẾT THÚC CẬP NHẬT */}
            </div>
          </div>
        </div>
        <p className="pt-4 text-center text-sm pb-5">
          {/* Thêm copyright */}
          © {new Date().getFullYear()} Dân Gian Việt Nam. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;