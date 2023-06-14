import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { useIsMounted } from "./hooks/useIsMounted";
import Image from "next/image";
import HotpotSVG from "../public/images/hotpot_text.svg";
import Link from "next/link";
import { auth, db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { signInWithPopup, TwitterAuthProvider } from "firebase/auth";

interface CurrentWallet {
  id: string;
  isFollowing: boolean;
  address: string;
}

type FetchState = "NOT_LOADING" | "LOADING" | "ERROR";

const Home: NextPage = () => {
  const mounted = useIsMounted();
  const { address } = useAccount();
  const [following, setIsFollowing] = useState(false);
  const [currentWalletFetchState, setCurrentWalletFetchState] =
    useState<FetchState>("NOT_LOADING");
  const [displayLastPage, setDisplayLastPage] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
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

      setAddressSaved(true);
    }

    if (address) {
      getWallets();
    } else {
      setCurrentWallet(null);
    }
  }, [address]);

  const signInWithTwitter = () => {
    const provider = new TwitterAuthProvider();
    // signInWithPopup(auth, provider).then(res=>console.log(res.user.)).catch(console.log);
  };

  async function handleFollow() {
    if (!currentWallet) return;
    try {
      const currentWalletRef = doc(db, "wallets", currentWallet.id);

      await updateDoc(currentWalletRef, {
        isFollowing: true,
      });

      setCurrentWallet({ ...currentWallet, isFollowing: true });
    } catch (error) {}

    setIsFollowing(true);
  }

  function handleDisplayLastPage() {
    setDisplayLastPage(true);
  }

  if (!mounted) return <></>;

  return (
    <div className={styles.container}>
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
        <ConnectButton />
        {address && (
          <div className="w-walletInfo h-walletInfo bg-purple1 border-2 border-white rounded-full flex items-center pl-4">
            <div className="w-16 h-16 bg-red-300 rounded-full mr-4"></div>
            <div className="text-2xl text-white font-bold">
              {address.slice(0, 5) + "..." + address.slice(38)}
            </div>
          </div>
        )}
        <button onClick={() => signInWithTwitter()}>Twitter</button>
      </header>
      <main className={styles.main}>
        {!address && (
          <>
            <div className="absolute bottom-80 left-20 fadeIn">
              <Image
                src={"/images/egg.png"}
                alt="logo"
                width={189}
                height={148}
              />
            </div>
            <div className="absolute top-52 left-80 fadeIn">
              <div className="upDown">
                <Image
                  src={"/images/golden_ticket_rotated.png"}
                  alt="logo"
                  width={233}
                  height={193}
                />
              </div>
            </div>
            <div className="absolute bottom-60 left-2/3 fadeIn">
              <Image
                src={"/images/mushroom.png"}
                alt="logo"
                width={107}
                height={113}
              />
            </div>
            <div className="absolute top-1/2 right-10 fadeIn">
              <Image
                src={"/images/naruto.png"}
                alt="logo"
                width={113}
                height={96}
              />
            </div>
            <div className="absolute top-5 -right-32 fadeIn">
              <Image
                src={"/images/pink_meat.png"}
                alt="logo"
                width={353}
                height={284}
              />
            </div>
          </>
        )}
        {address &&
          currentWalletFetchState === "NOT_LOADING" &&
          !currentWallet?.isFollowing && (
            <>
              <div className="absolute bottom-80 left-20 fadeIn">
                <Image
                  src={"/images/egg.png"}
                  alt="logo"
                  width={189}
                  height={148}
                />
              </div>
              <div className="absolute top-52 left-1/2 -translate-x-1/2 fadeIn">
                <Image
                  src={"/images/golden_ticket.png"}
                  alt="logo"
                  width={229}
                  height={239}
                />
              </div>
              <div className="absolute bottom-40 left-1/4 fadeIn">
                <Image
                  src={"/images/mushroom.png"}
                  alt="logo"
                  width={107}
                  height={113}
                />
              </div>
              <div className="absolute top-1/4 right-10 fadeIn">
                <Image
                  src={"/images/naruto.png"}
                  alt="logo"
                  width={113}
                  height={96}
                />
              </div>
              <div className="absolute bottom-52 right-1/4 rotate-12 fadeIn">
                <Image
                  src={"/images/cabbage.png"}
                  alt="logo"
                  width={120}
                  height={145}
                />
              </div>
            </>
          )}
        {currentWallet?.isFollowing && (
          <>
            <div className="absolute bottom-80 left-20 -rotate-12 fadeIn">
              <Image
                src={"/images/bokchoy.png"}
                alt="logo"
                width={108}
                height={158}
              />
            </div>
            <div className="absolute top-52 left-1/2 -translate-x-1/2 rotate-180 fadeIn">
              <Image
                src={"/images/shrimp.png"}
                alt="logo"
                width={179}
                height={189}
              />
            </div>
            <div className="absolute top-1/4 right-10 fadeIn">
              <Image
                src={"/images/naruto.png"}
                alt="logo"
                width={113}
                height={96}
              />
            </div>
            <div className="absolute bottom-52 right-1/4 rotate-12 fadeIn">
              <Image
                src={"/images/corn.png"}
                alt="logo"
                width={105}
                height={103}
              />
            </div>
          </>
        )}
        {!address && (
          <div className="flex flex-col items-center">
            <Image src={HotpotSVG} alt="HotPot" />
            <h1
              style={{ fontFamily: "boorsok", color: "#620DED" }}
              className="text-6xl"
            >
              The win-win NFT marketplace
            </h1>
            <div className="xx mt-16">
              <ConnectButton />
            </div>
          </div>
        )}
        {currentWallet && !alreadyFollower && !displayLastPage && (
          <div className="flex flex-col items-center">
            <h2
              style={{
                fontFamily: "boorsok",
                color: "#FF62D6",
                fontSize: "80px",
              }}
            >
              One Last Ingredient...
            </h2>
            <p
              style={{ fontFamily: "boorsok", color: "#620DED" }}
              className="text-subtitle"
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
        {currentWallet?.isFollowing && displayLastPage && (
          <div className="flex flex-col items-center">
            <h2
              style={{
                fontFamily: "boorsok",
                color: "#FF62D6",
                fontSize: "80px",
              }}
            >
              Welcome to the club!
            </h2>
            <p
              style={{ fontFamily: "boorsok", color: "#620DED" }}
              className="text-subtitle"
            >
              A special surprise awaits you at launch. Enjoy your head start.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
