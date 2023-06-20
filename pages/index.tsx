import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { useIsMounted } from "../hooks/useIsMounted";
import Image from "next/image";
import HotpotSVG from "../public/images/hotpot_text.svg";
import TwitterSVG from "../public/images/twitter_svg.svg";
import { db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import ReCAPTCHA from "react-google-recaptcha";

interface CurrentWallet {
  id: string | undefined;
  address: string | undefined;
  email: string | undefined;
}

type FetchState = "NOT_LOADING" | "LOADING" | "ERROR" | "SUCCESS";

const titleStyles = {
  fontFamily: "boorsok",
  color: "#FF62D6",
};

const subtitleStyles = { fontFamily: "boorsok", color: "#620DED" };

const Home: NextPage = () => {
  const mounted = useIsMounted();
  const { address } = useAccount();
  const [currentWalletFetchState, setCurrentWalletFetchState] =
    useState<FetchState>("NOT_LOADING");
  const [currentWallet, setCurrentWallet] = useState<CurrentWallet | null>(
    null
  );
  const [email, setEmail] = useState("");
  const [emailInvalid, setEmailInvalid] = useState(true);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [saveUserState, setSaveUserState] = useState<FetchState>("NOT_LOADING");

  useEffect(() => {
    async function getWallets() {
      if (!address) return;

      const walletsQuery = query(
        collection(db, "wallets"),
        where("address", "==", address)
      );

      try {
        setCurrentWalletFetchState("LOADING");
        const querySnapshot = await getDocs(walletsQuery);

        const wallets = querySnapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            } as CurrentWallet)
        );

        setCurrentWalletFetchState("NOT_LOADING");
        if (wallets.length) {
          const [currentWallet] = wallets;
          setCurrentWallet({
            id: currentWallet.id,
            address: currentWallet.address,
            email: currentWallet.email,
          });
        }
      } catch (error) {
        setCurrentWalletFetchState("ERROR");
      }
    }

    if (address) {
      getWallets();
    } else {
      setCurrentWallet(null);
    }
  }, [address]);

  async function handleFollow() {
    setIsFollowing(true);
  }

  async function saveUser() {
    setSaveUserState("LOADING");
    try {
      await addDoc(collection(db, "wallets"), {
        address,
        email,
      });

      setSaveUserState("SUCCESS");
    } catch (error) {
      setSaveUserState("ERROR");
    }
  }

  const validateEmail = (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value);
  };

  const handleBlur = () => {
    if (!validateEmail(email)) {
      setEmailInvalid(true);
    }
  };

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
    if (!validateEmail(e.target.value)) setEmailInvalid(true);
    else {
      setEmailInvalid(false);
    }
  };

  const onCaptchaChange = (value: boolean) => {
    if (value) {
      setCaptchaVerified(true);
    } else {
      setCaptchaVerified(false);
    }
  };

  if (!mounted) return <></>;

  const shouldRenderView2 =
    address &&
    !currentWallet &&
    !captchaVerified &&
    currentWalletFetchState !== "LOADING";

  const shouldRenderView3 = captchaVerified && saveUserState !== "SUCCESS";

  const shouldRenderView4 = saveUserState === "SUCCESS" || currentWallet?.email;

  return (
    <div className="relative">
      <Head>
        <title>HotPot</title>
        <meta content="HotPot" name="HotPot" />
        <link href="/images/logo_white_border.png" rel="icon" />
      </Head>

      {emailSubmitted && !captchaVerified && (
        <div className="absolute w-full h-full flex items-center justify-center z-10">
          <div className="absolute w-full h-full bg-black z-10 opacity-75"></div>

          <div className="z-20">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY}
              onChange={onCaptchaChange}
            />
          </div>
        </div>
      )}
      <div className="px-8 md:px-16 overflow-hidden">
        <header className="py-8 flex justify-between">
          <Image
            src={"/images/logo_white_border.png"}
            alt="logo"
            width={55}
            height={55}
          />
          {address && (
            <div className="w-walletInfo h-walletInfo bg-purple1 border-2 border-white rounded-full flex items-center pl-4">
              <div className="w-17 h-17 rounded-full mr-4">
                <Image
                  src={"/images/Avatar.png"}
                  alt="Avatar"
                  width={37}
                  height={37}
                />
              </div>
              <div className="text-2xl text-white font-bold">
                {address.slice(0, 5) + "..." + address.slice(38)}
              </div>
            </div>
          )}
        </header>
        <main className={styles.main}>
          {!address && (
            <>
              <div className="egg1 fadeIn">
                <Image
                  src={"/images/egg.png"}
                  alt="egg"
                  width={189}
                  height={148}
                />
              </div>
              <div className="ticket1 fadeIn">
                <div className="rotateAnim">
                  <Image
                    src={"/images/golden_ticket_rotated.png"}
                    alt="golden_ticket_rotated"
                    width={233}
                    height={193}
                  />
                </div>
              </div>
              <div className="mushroom1 fadeIn">
                <Image
                  src={"/images/mushroom.png"}
                  alt="mushroom"
                  width={107}
                  height={113}
                />
              </div>
              <div className="naruto1 fadeIn">
                <Image
                  src={"/images/naruto.png"}
                  alt="naruto"
                  width={113}
                  height={96}
                />
              </div>
              <div className="meat1 fadeIn">
                <Image
                  src={"/images/pink_meat.png"}
                  alt="pink_meat"
                  width={353}
                  height={284}
                />
              </div>
            </>
          )}
          {!address && (
            <div className="flex flex-col items-center">
              <Image src={HotpotSVG} alt="HotPot" />
              <h1
                style={{ fontFamily: "boorsok", color: "#620DED" }}
                className="text-3xl md:text-6xl"
              >
                The win-win NFT marketplace
              </h1>
              <div className="xx mt-16">
                <ConnectButton />
              </div>
            </div>
          )}

          {shouldRenderView3 && (
            <>
              <div className="fadeIn egg1 egg3">
                <Image
                  src={"/images/egg.png"}
                  alt="egg"
                  width={189}
                  height={148}
                />
              </div>
              <div className="fadeIn ticket2">
                <Image
                  src={"/images/golden_ticket.png"}
                  alt="golden_ticket"
                  width={229}
                  height={239}
                />
              </div>
              <div className="fadeIn naruto3">
                <Image
                  src={"/images/naruto.png"}
                  alt="naruto"
                  width={113}
                  height={96}
                />
              </div>
              <div className="cabbage fadeIn">
                <Image
                  src={"/images/cabbage.png"}
                  alt="cabbage"
                  width={120}
                  height={145}
                />
              </div>
            </>
          )}
          {shouldRenderView3 && (
            <div className="flex flex-col items-center">
              <h2
                className="text-5xl md:text-8xl lg:text-9xl mb-8 md:mb-16 text-center"
                style={titleStyles}
              >
                One Last Ingredient...
              </h2>
              <p
                style={subtitleStyles}
                className="text-3xl md:text-5xl mb-8 md:mb-16 w-3/4 text-center"
              >
                Follow us on twitter to secure your reward
              </p>
              <div className="flex flex-col items-center gap-4 mt-8">
                <a
                  target="_blank"
                  href="https://twitter.com/hotpot_gg"
                  rel="noopener noreferrer"
                >
                  <button
                    className="btn w-mainButton h-walletInfo rounded-full text-white text-button font-bold bg-pink1 hover:bg-pink2 flex items-center justify-center"
                    onClick={() => handleFollow()}
                  >
                    <Image src={TwitterSVG} alt="Twitter logo" />
                    <span className="ml-2">Follow</span>
                  </button>
                </a>
                <button
                  className="btn flex items-center justify-center w-mainButton h-walletInfo rounded-full text-purple1 text-button font-bold bg-white disabled:bg-gray-500 disabled:opacity-30 disabled:text-gray-900"
                  disabled={!isFollowing}
                  onClick={() => saveUser()}
                >
                  {saveUserState === "LOADING" ? (
                    <div className="spinner small " />
                  ) : saveUserState === "ERROR" ? (
                    "Something went wrong. Try again!"
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </div>
          )}
          {shouldRenderView4 && (
            <>
              <div className="bokchoy3 fadeIn">
                <Image
                  src={"/images/bokchoy.png"}
                  alt="bokchoy"
                  width={108}
                  height={158}
                />
              </div>
              <div className="fadeIn shrimp3">
                <Image
                  src={"/images/shrimp.png"}
                  alt="shrimp"
                  width={179}
                  height={189}
                />
              </div>
              <div className="fadeIn naruto1">
                <Image
                  src={"/images/naruto.png"}
                  alt="naruto"
                  width={113}
                  height={96}
                />
              </div>
              <div className="fadeIn corn3">
                <Image
                  src={"/images/corn.png"}
                  alt="corn"
                  width={105}
                  height={103}
                />
              </div>
            </>
          )}

          {shouldRenderView4 && (
            <div className="flex flex-col items-center">
              <h2
                style={titleStyles}
                className="text-5xl md:text-8xl lg:text-9xl mb-8 md:mb-16 text-center"
              >
                Welcome to the club!
              </h2>
              <p
                style={subtitleStyles}
                className="text-3xl md:text-5xl mb-8 md:mb-16 w-3/4 text-center"
              >
                A special surprise awaits you at launch. Enjoy your head start.
              </p>
            </div>
          )}

          {shouldRenderView2 && (
            <>
              <div className="fadeIn egg1">
                <Image
                  src={"/images/dumpling.png"}
                  alt="dumpling"
                  width={87}
                  height={81}
                />
              </div>
              <div className="fadeIn ticket2">
                <Image
                  src={"/images/pepper.png"}
                  alt="pepper"
                  width={143}
                  height={144}
                />
              </div>
              <div className="fadeIn corn3 corn2">
                <Image
                  src={"/images/corn.png"}
                  alt="corn"
                  width={105}
                  height={103}
                />
              </div>
            </>
          )}
          {shouldRenderView2 && (
            <div className="flex flex-col items-center">
              <h2
                style={titleStyles}
                className="text-5xl md:text-8xl lg:text-9xl mb-8 md:mb-16 text-center"
              >
                Spice up your inbox
              </h2>
              <p
                style={subtitleStyles}
                className="text-3xl md:text-5xl mb-8 md:mb-16 w-3/4 text-center"
              >
                Be notified when claiming is live
              </p>
              <div className="flex flex-col items-center gap-4 mt-8">
                <input
                  type="email"
                  value={email}
                  onBlur={handleBlur}
                  onChange={handleEmailChange}
                  className="email-input"
                  placeholder="Enter Email"
                />

                <button
                  className="btn w-mainButton h-walletInfo rounded-full text-purple1 text-button font-bold bg-white disabled:bg-gray-500 disabled:opacity-30 disabled:text-gray-900"
                  disabled={emailInvalid}
                  onClick={() => setEmailSubmitted(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
          {currentWalletFetchState === "LOADING" && <div className="spinner" />}
        </main>
      </div>
    </div>
  );
};

export default Home;
