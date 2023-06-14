import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { useIsMounted } from "../hooks/useIsMounted";
import Image from "next/image";
import HotpotSVG from "../public/images/hotpot_text.svg";
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

interface CurrentWallet {
  id: string;
  isFollowing: boolean;
  address: string;
}

type FetchState = "NOT_LOADING" | "LOADING" | "ERROR";

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
  const [displayLastPage, setDisplayLastPage] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<CurrentWallet | null>(
    null
  );
  const [alreadyFollower, setAlreadyFollower] = useState(false);

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

        if (wallets.length === 0) {
          const docRef = await addDoc(collection(db, "wallets"), {
            address,
          });

          setCurrentWallet({ id: docRef.id, address, isFollowing: false });
          setCurrentWalletFetchState("NOT_LOADING");
        } else {
          const [currentWallet] = wallets;
          setCurrentWalletFetchState("NOT_LOADING");
          setCurrentWallet({
            id: currentWallet.id,
            address: currentWallet.address,
            isFollowing: currentWallet.isFollowing,
          });
          setAlreadyFollower(currentWallet.isFollowing);
          setDisplayLastPage(currentWallet.isFollowing);
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
    if (!currentWallet) return;
    try {
      const currentWalletRef = doc(db, "wallets", currentWallet.id);

      await updateDoc(currentWalletRef, {
        isFollowing: true,
      });

      setCurrentWallet({ ...currentWallet, isFollowing: true });
    } catch (error) {}
  }

  function handleDisplayLastPage() {
    setDisplayLastPage(true);
  }

  if (!mounted) return <></>;

  const shouldRenderSecondView =
    currentWallet && !alreadyFollower && !displayLastPage;
  const shouldRenderThirdView = currentWallet?.isFollowing && displayLastPage;

  return (
    <div className="px-8 md:px-16 overflow-hidden">
      <Head>
        <title>HotPot</title>
        <meta content="HotPot" name="HotPot" />
        <link href="/favicon.ico" rel="icon" />
      </Head>
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
            <div className="absolute bottom-20 -left-10 sm:bottom-48 sm:left-20 fadeIn scale-50 md:scale-75 lg:scale-100:bottom-48 sm:left-20 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/egg.png"}
                alt="egg"
                width={189}
                height={148}
              />
            </div>
            <div className="absolute top-28 left-1 md:top-28 md:left-0 lg:top-28 lg:left-80 fadeIn scale-50 md:scale-75 lg:scale-100">
              <div className="upDown">
                <Image
                  src={"/images/golden_ticket_rotated.png"}
                  alt="golden_ticket_rotated"
                  width={233}
                  height={193}
                />
              </div>
            </div>
            <div className="absolute bottom-20 left-80 sm:bottom-28 sm:left-2/3 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/mushroom.png"}
                alt="mushroom"
                width={107}
                height={113}
              />
            </div>
            <div className="absolute bottom-1/4 -right-8 md:right-20 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/naruto.png"}
                alt="naruto"
                width={113}
                height={96}
              />
            </div>
            <div className="absolute -top-28 -right-64 sm:top-0 sm:-right-48 lg:-right-32 fadeIn scale-50 md:scale-75 xl:scale-100">
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
        {shouldRenderSecondView && (
          <>
            <div className="absolute bottom-40 -left-10 sm:bottom-48 sm:left-20 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/egg.png"}
                alt="egg"
                width={189}
                height={148}
              />
            </div>
            <div className="absolute top-44 left-1/2 -translate-x-1/2 fadeIn">
              <Image
                src={"/images/golden_ticket.png"}
                alt="golden_ticket"
                width={229}
                height={239}
              />
            </div>
            <div className="absolute bottom-10 left-1/4 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/mushroom.png"}
                alt="mushroom"
                width={107}
                height={113}
              />
            </div>
            <div className="absolute top-60 -right-8 lg:right-8 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/naruto.png"}
                alt="naruto"
                width={113}
                height={96}
              />
            </div>
            <div className="absolute bottom-28 right-0 sm:bottom-28 sm:left-2/3 rotate-12 scale-50 md:scale-75 lg:scale-100 fadeIn">
              <Image
                src={"/images/cabbage.png"}
                alt="cabbage"
                width={120}
                height={145}
              />
            </div>
          </>
        )}
        {shouldRenderSecondView && (
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
                href="https://twitter.com/metalistingsxyz"
                rel="noopener noreferrer"
              >
                <button
                  className="w-mainButton h-walletInfo rounded-full text-white text-button font-bold bg-pink1 hover:bg-pink2"
                  onClick={() => handleFollow()}
                >
                  Follow
                </button>
              </a>
              <button
                className="w-mainButton h-walletInfo rounded-full text-purple1 text-button font-bold bg-white disabled:bg-gray-500 disabled:opacity-30 disabled:text-gray-900"
                disabled={!currentWallet.isFollowing}
                onClick={() => handleDisplayLastPage()}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {shouldRenderThirdView && (
          <>
            <div className="absolute bottom-48 -left-10 lg:bottom-1/4 lg:left-40 -rotate-12 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/bokchoy.png"}
                alt="bokchoy"
                width={108}
                height={158}
              />
            </div>
            <div className="absolute top-52 left-1/2 -translate-x-1/2 rotate-180 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/shrimp.png"}
                alt="shrimp"
                width={179}
                height={189}
              />
            </div>
            <div className="absolute top-80 -right-8 lg:right-8 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/naruto.png"}
                alt="naruto"
                width={113}
                height={96}
              />
            </div>
            <div className="absolute bottom-40 right-8 md:bottom-36 md:right-40 lg:bottom-48 lg:right-1/4  rotate-12 fadeIn scale-50 md:scale-75 lg:scale-100">
              <Image
                src={"/images/corn.png"}
                alt="corn"
                width={105}
                height={103}
              />
            </div>
          </>
        )}

        {shouldRenderThirdView && (
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
        {currentWalletFetchState === "LOADING" && <div className="spinner" />}
      </main>
    </div>
  );
};

export default Home;
