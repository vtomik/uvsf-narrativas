export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="44"
      viewBox="0 0 40 44"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="14"
        cy="20"
        rx="8"
        ry="16"
        transform="rotate(-32 14 20)"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <ellipse
        cx="26"
        cy="20"
        rx="8"
        ry="16"
        transform="rotate(32 26 20)"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M20 39V4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function ThreadStar({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 3V37M3 20H37M8 8L32 32M8 32L32 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VoiceArt({
  voice,
  className = "",
}: {
  voice: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 140 140"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {voice === "paciente" ? (
        <>
          <path
            d="M70 125V65M70 100C23 100 15 59 25 31C58 37 77 65 70 100Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M70 78C106 80 122 43 111 16C83 22 66 47 70 78ZM30 41L70 99M106 27L70 78"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M70 112C97 116 118 103 123 81C98 76 78 85 70 112Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </>
      ) : voice === "cuidadora" ? (
        <>
          <path
            d="M23 77C1 31 53 10 70 43C87 10 139 31 117 77C107 96 87 112 70 127C53 112 33 96 23 77Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M36 76C20 43 57 29 70 53C83 29 120 43 104 76C96 92 82 103 70 114C58 103 44 92 36 76Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M49 75C39 55 62 47 70 62C78 47 101 55 91 75C86 85 77 93 70 99C63 93 54 85 49 75Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </>
      ) : (
        <>
          <path
            d="M70 123V30M24 75H116M37 42L103 108M37 108L103 42"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle
            cx="70"
            cy="75"
            r="33"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle
            cx="70"
            cy="75"
            r="49"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="1 6"
          />
          <circle
            cx="70"
            cy="75"
            r="15"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M70 30C52 12 41 19 42 32M70 30C88 12 99 19 98 32"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </>
      )}
    </svg>
  );
}

export function HeroArt() {
  return (
    <div
      className="hero-art"
      aria-label="Ilustración de tres siluetas conectadas por un mismo hilo"
    >
      <div className="art-topline">
        <span>TRES MIRADAS POÉTICAS</span>
        <span>EST. 2026</span>
      </div>
      <svg
        className="portraits"
        viewBox="0 0 600 530"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="paper"
            x1="300"
            y1="0"
            x2="300"
            y2="530"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#DED9BE" />
            <stop offset="1" stopColor="#CFCCAF" />
          </linearGradient>
          <linearGradient
            id="olive"
            x1="70"
            y1="140"
            x2="210"
            y2="440"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#889376" />
            <stop offset="1" stopColor="#ABB297" />
          </linearGradient>
          <linearGradient
            id="clay"
            x1="280"
            y1="90"
            x2="350"
            y2="470"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#BB7A5B" />
            <stop offset="1" stopColor="#D3A07B" />
          </linearGradient>
          <linearGradient
            id="forest"
            x1="450"
            y1="170"
            x2="500"
            y2="480"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3A5948" />
            <stop offset="1" stopColor="#64816A" />
          </linearGradient>
        </defs>
        <path fill="url(#paper)" d="M0 0H600V530H0z" />
        <circle cx="301" cy="192" r="161" stroke="#F4EED9" strokeWidth="1" />
        <circle
          cx="301"
          cy="192"
          r="182"
          stroke="#F4EED9"
          strokeWidth=".7"
          opacity=".7"
        />
        <circle
          cx="301"
          cy="192"
          r="202"
          stroke="#F4EED9"
          strokeWidth=".7"
          opacity=".4"
        />
        <circle cx="300" cy="62" r="23" fill="#BCA060" />
        <path
          d="M32 530V292C32 209 76 172 127 172C181 172 223 213 223 292V530"
          fill="url(#olive)"
        />
        <path
          d="M193 530V225C193 146 237 107 295 107C352 107 397 147 397 225V530"
          fill="url(#clay)"
        />
        <path
          d="M374 530V293C374 211 414 171 467 171C522 171 565 212 565 293V530"
          fill="url(#forest)"
        />
        <g
          stroke="#F7EFDC"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M54 530C58 453 78 425 109 411L113 369C81 350 70 318 76 284C81 251 106 233 132 239C156 244 168 262 167 288L183 319C185 324 179 328 167 328L165 352C162 370 150 377 134 372L133 408C166 425 190 457 199 530" />
          <path d="M116 290C125 285 134 286 140 290M122 291L128 291M167 341L151 341M151 341C153 347 158 349 165 348M111 318C98 301 93 319 107 330M118 354C127 366 141 373 152 374M63 274C64 242 79 223 101 219M73 248C90 214 123 207 147 223" />
          <path d="M222 530C223 443 241 416 270 395L272 349C254 343 240 320 239 296L233 274L246 261C242 236 241 207 259 188C285 160 326 167 342 194C352 212 350 236 343 251C356 241 364 251 356 264L343 281C341 311 326 339 309 349L311 395C345 419 367 460 368 530" />
          <path d="M260 237C270 232 282 233 290 237M267 240L275 240M314 236C322 231 331 232 337 237M320 239L327 239M300 242L294 275L305 277M284 297C294 303 308 302 317 296M282 310C294 315 307 314 314 309M272 349C282 356 296 357 309 349M253 207C262 197 263 188 263 182M266 182C281 205 307 215 343 214" />
          <path d="M403 530C406 461 420 436 449 414L449 375C430 373 421 363 420 343L418 325C405 324 401 319 405 313L422 283C418 254 433 234 459 230C486 226 507 244 512 273C519 305 511 336 491 355L493 412C526 435 545 467 548 530" />
          <path d="M425 288C434 284 441 284 447 289M431 291H436M420 338H433M433 338C431 345 426 346 420 344M476 313C488 298 494 315 481 328M449 375C459 372 469 365 475 356M427 267C434 249 458 246 474 253M455 217C486 214 514 235 521 269M510 243L510 255" />
          <path
            d="M108 411C96 455 117 476 137 488M133 408C131 455 160 476 174 480M270 395L294 423L311 395M294 423V530M449 414L472 439L493 412M472 439V530"
            opacity=".8"
          />
        </g>
        <path
          d="M-35 456C35 370 132 484 200 435C262 390 244 338 297 359C355 382 328 475 400 455C477 434 507 360 637 408"
          stroke="#F7E7BF"
          strokeWidth="1.4"
        />
        <g fill="#F7E7BF">
          <circle cx="120" cy="439" r="4" />
          <circle cx="294" cy="358" r="4" />
          <circle cx="474" cy="425" r="4" />
        </g>
        <path d="M25 511H575" stroke="#F2E9CF" strokeWidth=".7" opacity=".5" />
        <g
          fill="#F4EED9"
          fontFamily="sans-serif"
          fontSize="10"
          letterSpacing="3"
        >
          <text x="104" y="505">
            01
          </text>
          <text x="283" y="505">
            02
          </text>
          <text x="464" y="505">
            03
          </text>
        </g>
      </svg>
      <div className="art-caption">
        <ThreadStar className="art-star" />
        <p>
          Los tres tienen miedo,
          <br />
          <em>pero no le temen a lo mismo.</em>
        </p>
        <span className="art-caption-index">I — III</span>
      </div>
    </div>
  );
}
