"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "../lib/supabase";
import { API_URL } from "../lib/api";

import Sidebar from "../components/Sidebar";
import TradeForm from "../components/TradeForm";
import TradesTable from "../components/TradesTable";
import StatisticsCards from "../components/StatisticsCards";
import PerformanceChart from "../components/PerformanceChart";

import type {
  Session,
} from "@supabase/supabase-js";


type Trade = [
  number,
  string,
  string,
  number,
  number | null,
  number,
  number | null,
  number,
  string,
  string
];


type Account = {
  id: number;
  user_id: string;
  name: string;
  starting_balance: number;
  currency: string;
  broker: string | null;
  account_type: string | null;
  created_at?: string;
};


export default function Home() {
  const router =
    useRouter();


  const [
    showForm,
    setShowForm,
  ] = useState(false);


  const [
    symbol,
    setSymbol,
  ] = useState("");

  const [
    direction,
    setDirection,
  ] = useState("");

  const [
    entry,
    setEntry,
  ] = useState("");

  const [
    stop,
    setStop,
  ] = useState("");

  const [
    exit,
    setExit,
  ] = useState("");

  const [
    pnl,
    setPnl,
  ] = useState("");

  const [
    entryDatetime,
    setEntryDatetime,
  ] = useState("");


  const [
    exitDatetime,
    setExitDatetime,
  ] = useState("");

  const [tradeError, setTradeError] =
    useState<string | null>(null);

  const [
    tradeFormError,
    setTradeFormError,
  ] = useState<string | null>(null);


  const [
    trades,
    setTrades,
  ] = useState<Trade[]>([]);


  const [
    editingTradeId,
    setEditingTradeId,
  ] = useState<number | null>(
    null
  );


  const [
    accounts,
    setAccounts,
  ] = useState<Account[]>([]);


  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState<number | null>(
    null
  );


  const [
    userEmail,
    setUserEmail,
  ] = useState<string | null>(
    null
  );


  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);


  const [
    session,
    setSession,
  ] = useState<Session | null>(
    null
  );


  const [
    dashboardLoading,
    setDashboardLoading,
  ] = useState(true);


  const selectedAccount =
    accounts.find(
      (account) =>
        account.id ===
        selectedAccountId
    ) ?? null;


  async function loadTrades(
    accessToken: string,
    accountId: number
  ) {
    const response =
      await fetch(
        `${API_URL}/trades?account_id=${accountId}`,
        {
          cache:
            "no-store",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );

    if (!response.ok) {
      return;
    }

    const data: Trade[] =
      await response.json();

    setTrades(data);
  }


  async function handleLogout() {
    await supabase.auth.signOut();

    setUserEmail(null);

    router.push(
      "/login"
    );
  }


  useEffect(() => {
    async function loadUser() {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (!session) {
        router.push(
          "/login"
        );

        return;
      }

      setUserEmail(
        session.user.email ??
        null
      );

      setSession(
        session
      );

      setAuthLoading(
        false
      );
    }


    loadUser();


    const {
      data,
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          if (!session) {
            router.push(
              "/login"
            );

            return;
          }

          setSession(
            session
          );

          setUserEmail(
            session.user.email ??
            null
          );
        }
      );


    return () => {
      data.subscription.unsubscribe();
    };
  }, [
    router,
  ]);


  useEffect(() => {
    if (!session) {
      return;
    }

    const accessToken =
      session.access_token;


    async function loadDashboard() {
      setDashboardLoading(
        true
      );

      const response =
        await fetch(
          `${API_URL}/accounts`,
          {
            cache:
              "no-store",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        );


      if (response.ok) {
        const data: Account[] =
          await response.json();

        setAccounts(
          data
        );


        if (
          data.length >
          0
        ) {
          setSelectedAccountId(
            (current) =>
              current === null
                ? data[0].id
                : current
          );
        }
      }


      setDashboardLoading(
        false
      );
    }


    loadDashboard();
  }, [
    session,
  ]);


  useEffect(() => {
    if (
      !session ||
      selectedAccountId ===
      null
    ) {
      return;
    }


    async function fetchTrades() {
      await loadTrades(
        session!.access_token,
        selectedAccountId!
      );
    }


    fetchTrades();
  }, [
    session,
    selectedAccountId,
  ]);


  async function handleSaveTrade() {
    if (
      !symbol ||
      !direction ||
      !entry ||
      !exit ||
      !pnl ||
      !entryDatetime ||
      !exitDatetime
    ) {
      setTradeFormError(
        "Please fill in all required fields."
      );

      return;
    }

    setTradeFormError(null);

    if (
      new Date(exitDatetime) <
      new Date(entryDatetime)
    ) {
      setTradeError(
        "Exit date cannot be before entry date."
      );

      return;
    }


    const accountId =
      selectedAccountId!;


    const tradeData = {
      account_id:
        accountId,

      symbol,
      direction,

      entry:
        Number(entry),

      stop:
        stop === ""
          ? null
          : Number(stop),

      exit:
        Number(exit),

      pnl:
        Number(pnl),

      entry_datetime:
        entryDatetime,

      exit_datetime:
        exitDatetime,
    };


    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();


    if (!session) {
      router.push(
        "/login"
      );

      return;
    }


    const response =
      await fetch(
        `${API_URL}/trades`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body:
            JSON.stringify(
              tradeData
            ),
        }
      );


    if (response.ok) {
      await loadTrades(
        session.access_token,
        accountId
      );


      setSymbol("");
      setDirection("");
      setEntry("");
      setStop("");
      setExit("");
      setPnl("");

      setEntryDatetime(
        ""
      );

      setExitDatetime(
        ""
      );

      setShowForm(
        false
      );
    }
  }


  async function handleDeleteTrade(
    tradeId: number
  ) {

    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();


    if (!session) {
      router.push(
        "/login"
      );

      return;
    }


    const response =
      await fetch(
        `${API_URL}/trades/${tradeId}`,
        {
          method:
            "DELETE",

          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );


    if (response.ok) {
      setTrades(
        (
          currentTrades
        ) =>
          currentTrades.filter(
            (trade) =>
              trade[0] !==
              tradeId
          )
      );
    }
  }


  function handleEditTrade(
    trade: Trade
  ) {
    setShowForm(
      false
    );

    setEditingTradeId(
      trade[0]
    );


    setSymbol(
      trade[1]
    );

    setDirection(
      trade[2]
    );

    setEntry(
      String(
        trade[3]
      )
    );

    setStop(
      trade[4] === null
        ? ""
        : String(trade[4])
    );

    setExit(
      String(
        trade[5]
      )
    );

    setPnl(
      String(
        trade[7]
      )
    );


    setEntryDatetime(
      trade[8].slice(
        0,
        16
      )
    );

    setExitDatetime(
      trade[9].slice(
        0,
        16
      )
    );
  }


  async function handleUpdateTrade(
    tradeId: number
  ) {
    if (
      !entryDatetime ||
      !exitDatetime
    ) {
      return;
    }


    const tradeData = {
      symbol,
      direction,

      entry:
        Number(entry),

      stop:
        stop === ""
          ? null
          : Number(stop),

      exit:
        Number(exit),

      pnl:
        Number(pnl),

      entry_datetime:
        entryDatetime,

      exit_datetime:
        exitDatetime,
    };


    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();


    if (!session) {
      router.push(
        "/login"
      );

      return;
    }


    const response =
      await fetch(
        `${API_URL}/trades/${tradeId}`,
        {
          method:
            "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body:
            JSON.stringify(
              tradeData
            ),
        }
      );


    if (response.ok) {
      await loadTrades(
        session.access_token,
        selectedAccountId!
      );

      setEditingTradeId(
        null
      );
    }
  }


  if (authLoading) {
    return null;
  }


  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        userEmail={
          userEmail
        }
        onLogout={
          handleLogout
        }
      />


      <main className="min-w-0 flex-1 px-5 py-5 sm:px-6 md:px-8 md:py-8 xl:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="pl-14 md:pl-0">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of your trading performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedAccountId !== null && (
              <select
                value={
                  selectedAccountId
                }
                onChange={(
                  event
                ) =>
                  setSelectedAccountId(
                    Number(
                      event
                        .target
                        .value
                    )
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900"
              >
                {accounts.map(
                  (
                    account
                  ) => (
                    <option
                      key={
                        account.id
                      }
                      value={
                        account.id
                      }
                    >
                      {
                        account.name
                      }
                    </option>
                  )
                )}
              </select>
            )}


            <button
              type="button"
              onClick={() => {
                setEditingTradeId(
                  null
                );

                setSymbol("");
                setDirection("");
                setEntry("");
                setStop("");
                setExit("");
                setPnl("");

                setEntryDatetime(
                  ""
                );

                setExitDatetime(
                  ""
                );

                setTradeFormError(
                  null
                );

                setShowForm(
                  !showForm
                );
              }}
              disabled={
                selectedAccountId ===
                null
              }
              className="cursor-pointer rounded-lg bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Add Trade
            </button>
          </div>
        </div>


        {!dashboardLoading &&
          accounts.length ===
          0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Create a trading
              account before adding
              trades.
            </div>
          )}


        {showForm &&
          selectedAccountId !==
          null && (
            <>
              <TradeForm
                symbol={
                  symbol
                }
                direction={
                  direction
                }
                entry={
                  entry
                }
                stop={
                  stop
                }
                exit={
                  exit
                }
                pnl={
                  pnl
                }
                entryDatetime={
                  entryDatetime
                }
                exitDatetime={
                  exitDatetime
                }
                setSymbol={
                  setSymbol
                }
                setDirection={
                  setDirection
                }
                setEntry={
                  setEntry
                }
                setStop={
                  setStop
                }
                setExit={
                  setExit
                }
                setPnl={
                  setPnl
                }
                setEntryDatetime={
                  setEntryDatetime
                }
                setExitDatetime={
                  setExitDatetime
                }
                onSave={
                  handleSaveTrade
                }
              />

              {tradeFormError && (
                <p className="mt-2 text-sm text-red-600">
                  {tradeFormError}
                </p>
              )}
            </>
          )}


        {dashboardLoading ? (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 6,
              }).map(
                (
                  _,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="h-24 animate-pulse rounded-xl bg-slate-200"
                  />
                )
              )}
            </div>

            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-slate-200" />

            <div className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-200" />
          </>
        ) : (
          <>
            <StatisticsCards
              trades={
                trades
              }
              startingBalance={
                selectedAccount
                  ?.starting_balance ??
                0
              }
              currency={
                selectedAccount
                  ?.currency ??
                ""
              }
            />


            <PerformanceChart
              trades={
                trades
              }
              currency={
                selectedAccount
                  ?.currency ??
                ""
              }
            />


            <TradesTable
              trades={
                trades.slice(
                  0,
                  5
                )
              }
              showViewAll={
                true
              }
              selectedAccountId={
                selectedAccountId
              }
              editingTradeId={
                editingTradeId
              }
              symbol={
                symbol
              }
              direction={
                direction
              }
              entry={
                entry
              }
              stop={
                stop
              }
              exit={
                exit
              }
              pnl={
                pnl
              }
              entryDatetime={
                entryDatetime
              }
              exitDatetime={
                exitDatetime
              }
              setSymbol={
                setSymbol
              }
              setDirection={
                setDirection
              }
              setEntry={
                setEntry
              }
              setStop={
                setStop
              }
              setExit={
                setExit
              }
              setPnl={
                setPnl
              }
              setEntryDatetime={
                setEntryDatetime
              }
              setExitDatetime={
                setExitDatetime
              }
              onEdit={
                handleEditTrade
              }
              onUpdate={
                handleUpdateTrade
              }
              onDelete={
                handleDeleteTrade
              }
            />
          </>
        )}
      </main>
      {tradeError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-rose-600">
              Invalid trade
            </h3>

            <p className="mt-3 text-sm leading-6 text-zinc-700">
              {tradeError}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setTradeError(null)
                }
                className="cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}