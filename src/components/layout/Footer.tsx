import logoImage from "../../assets/Giao dien home-06.png";
import bgFooter from "../../assets/Img_category/Giao dien home-01.png";

const Footer = () => {
  return (
    <footer 
      className="w-full text-gray-300 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgFooter})` }}
    >
      <div className="px-6 pt-8 md:px-16 lg:px-36 w-full relative z-10">
        <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-10">
          <div className="md:max-w-96">
            <img 
              src={logoImage} 
              alt="Dân Gian Việt Nam Logo" 
              className="w-80 h-auto"
            />
            <div className="flex items-center gap-2 mt-4">
              <img
                src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/googlePlayBtnBlack.svg"
                alt="google play"
                className="h-10 w-auto border border-white rounded"
              />
              <img
                src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/appleStoreBtnBlack.svg"
                alt="app store"
                className="h-10 w-auto border border-white rounded"
              />
            </div>
          </div>
          <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
            <div>
              <h2 className="font-semibold mb-5">Company</h2>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="#">About us</a>
                </li>
                <li>
                  <a href="#">Contact us</a>
                </li>
                <li>
                  <a href="#">Privacy policy</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-5">Get in touch</h2>
              <div className="text-sm space-y-2">
                <p>+84-357-663-145</p>
              </div>
            </div>
          </div>
        </div>
        <p className="pt-4 text-center text-sm pb-5">
          Copyright {new Date().getFullYear()} © PreBuiltUI. All Right Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;