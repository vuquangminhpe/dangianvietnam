const Footer = () => {
  return (
    <footer className="px-6 pt-8 md:px-16 lg:px-36 w-full text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-10">
        <div className="md:max-w-96">
          <svg
            width="80"
            height="80"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="modernBg" cx="50%" cy="40%" r="60%">
                <stop
                  offset="0%"
                  className="stop-color:#CC1A1A;stop-opacity:1"
                />
                <stop
                  offset="70%"
                  className="stop-color:#8B0000;stop-opacity:1"
                />
                <stop
                  offset="100%"
                  className="stop-color:#4A0000;stop-opacity:1"
                />
              </radialGradient>

              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  className="stop-color:#FFE55C;stop-opacity:1"
                />
                <stop
                  offset="50%"
                  className="stop-color:#FFD700;stop-opacity:1"
                />
                <stop
                  offset="100%"
                  className="stop-color:#DAA520;stop-opacity:1"
                />
              </linearGradient>

              <filter
                id="dropShadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="2"
                  dy="4"
                  stdDeviation="3"
                  flood-opacity="0.3"
                />
              </filter>

              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="200"
              cy="200"
              r="190"
              fill="url(#modernBg)"
              stroke="url(#goldGrad)"
              stroke-width="4"
              filter="url(#dropShadow)"
            />

            <circle
              cx="200"
              cy="200"
              r="170"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="2"
              opacity="0.6"
            />

            <circle
              cx="200"
              cy="200"
              r="140"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="4"
              filter="url(#glow)"
            />
            <circle
              cx="200"
              cy="200"
              r="120"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="3"
              opacity="0.8"
            />
            <circle
              cx="200"
              cy="200"
              r="100"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="2"
              opacity="0.6"
            />
            <circle
              cx="200"
              cy="200"
              r="80"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="2"
              opacity="0.4"
            />

            <circle
              cx="200"
              cy="200"
              r="35"
              fill="url(#goldGrad)"
              filter="url(#glow)"
            />
            <circle cx="200" cy="200" r="28" fill="#FFE55C" opacity="0.8" />

            <g
              stroke="url(#goldGrad)"
              stroke-width="3"
              fill="none"
              filter="url(#glow)"
            >
              <line x1="200" y1="165" x2="200" y2="150" />
              <line x1="225" y1="175" x2="235" y2="165" />
              <line x1="235" y1="200" x2="250" y2="200" />
              <line x1="225" y1="225" x2="235" y2="235" />
              <line x1="200" y1="235" x2="200" y2="250" />
              <line x1="175" y1="225" x2="165" y2="235" />
              <line x1="165" y1="200" x2="150" y2="200" />
              <line x1="175" y1="175" x2="165" y2="165" />
            </g>

            <g transform="translate(170, 150)" filter="url(#dropShadow)">
              <rect
                x="25"
                y="25"
                width="14"
                height="45"
                fill="url(#goldGrad)"
                rx="7"
              />
              <circle cx="32" cy="20" r="12" fill="url(#goldGrad)" />
              <line
                x1="18"
                y1="35"
                x2="8"
                y2="25"
                stroke="url(#goldGrad)"
                stroke-width="4"
              />
              <circle cx="8" cy="25" r="3" fill="#DAA520" />
              <line
                x1="46"
                y1="35"
                x2="56"
                y2="25"
                stroke="url(#goldGrad)"
                stroke-width="4"
              />
              <circle cx="56" cy="25" r="3" fill="#DAA520" />
              <line
                x1="28"
                y1="70"
                x2="22"
                y2="85"
                stroke="url(#goldGrad)"
                stroke-width="4"
              />
              <line
                x1="36"
                y1="70"
                x2="42"
                y2="85"
                stroke="url(#goldGrad)"
                stroke-width="4"
              />

              <line
                x1="8"
                y1="25"
                x2="2"
                y2="18"
                stroke="#8B4513"
                stroke-width="3"
              />
              <line
                x1="56"
                y1="25"
                x2="62"
                y2="18"
                stroke="#8B4513"
                stroke-width="3"
              />
            </g>

            <g
              transform="translate(90, 80) scale(1.2)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
              <path
                d="M15,17 Q12,25 15,30"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="1"
              />
            </g>

            <g
              transform="translate(280, 90) scale(1.2) rotate(30)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <g
              transform="translate(320, 200) scale(1.2) rotate(90)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <g
              transform="translate(290, 310) scale(1.2) rotate(150)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <g
              transform="translate(110, 320) scale(1.2) rotate(210)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <g
              transform="translate(70, 200) scale(1.2) rotate(270)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <text
              x="200"
              y="60"
              font-family="Georgia, serif"
              font-size="24"
              fill="url(#goldGrad)"
              text-anchor="middle"
              font-weight="bold"
              filter="url(#glow)"
            >
              DÂN GIAN
            </text>

            <text
              x="200"
              y="360"
              font-family="Georgia, serif"
              font-size="24"
              fill="url(#goldGrad)"
              text-anchor="middle"
              font-weight="bold"
              filter="url(#glow)"
            >
              VIỆT NAM
            </text>

            <g opacity="0.4">
              <path
                d="M30,30 Q45,15 60,30 Q45,45 30,30"
                fill="url(#goldGrad)"
                filter="url(#glow)"
              />
              <path
                d="M340,30 Q355,15 370,30 Q355,45 340,30"
                fill="url(#goldGrad)"
                filter="url(#glow)"
              />
              <path
                d="M30,370 Q45,355 60,370 Q45,385 30,370"
                fill="url(#goldGrad)"
                filter="url(#glow)"
              />
              <path
                d="M340,370 Q355,355 370,370 Q355,385 340,370"
                fill="url(#goldGrad)"
                filter="url(#glow)"
              />
            </g>

            <circle
              cx="200"
              cy="200"
              r="185"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="1"
              opacity="0.3"
            />
          </svg>

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
    </footer>
  );
};

export default Footer;
