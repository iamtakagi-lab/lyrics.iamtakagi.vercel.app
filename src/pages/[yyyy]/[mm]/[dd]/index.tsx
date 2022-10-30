import { GetServerSidePropsContext } from "next";
import { Song } from "../../../../common/types";
import { database } from "../../../../common/supabase";
import Head from "next/head";
import "moment/locale/ja";
import moment from "moment";
import { STATUS_CODES } from "http";

type Props = {
  date?: string;
  song?: Song;
  lastfmUserId?: string;
  siteDomain?: string;
  twitterId?: string;
  error?: {
    statusCode: number;
    statusLabel: string;
    message: string;
  };
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  ctx.res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  const { yyyy, mm, dd } = ctx.query;
  const date = `${yyyy}/${mm}/${dd}`;

  // それは本当に日付ですか
  if (isNaN(new Date(date).getDate())) {
    ctx.res.statusCode = 500;
    return {
      props: {
        siteDomain: process.env.SITE_DOMAIN ?? "",
        lastfmUserId: process.env.LASTFM_USER_ID ?? "",
        twitterId: process.env.TWITTER_ID ?? "",
        error: {
          statusCode: 500,
          statusLabel: STATUS_CODES[500],
          message: "正しい日付を指定してください",
        },
      },
    };
  }

  const { data, error, status } = await database
    .from("songs")
    .select("*")
    .limit(1)
    .eq("date", date);
  if (!data || !data.length || !data[0] || error) {
    ctx.res.statusCode = 404;
    return {
      props: {
        date,
        siteDomain: process.env.SITE_DOMAIN ?? "",
        lastfmUserId: process.env.LASTFM_USER_ID ?? "",
        twitterId: process.env.TWITTER_ID ?? "",
        error: {
          statusCode: 404,
          statusLabel: STATUS_CODES[404],
          message: `${date} の歌詞はありません`,
        },
      },
    };
  }

  //console.log(data[0]);
  ctx.res.statusCode = 200;
  return {
    props: {
      date,
      song: data[0],
      siteDomain: process.env.SITE_DOMAIN ?? "",
      lastfmUserId: process.env.LASTFM_USER_ID ?? "",
      twitterId: process.env.TWITTER_ID ?? "",
    },
  };
};

export const DatePage = ({
  date,
  lastfmUserId,
  song,
  siteDomain,
  twitterId,
  error,
}: Props) => {
  const yesterday = moment(date).add(-1, "days").format("YYYY/MM/DD");
  const tomorrow = moment(date).add(1, "days").format("YYYY/MM/DD");

  if (error && siteDomain && twitterId) {
    return (
      <>
        <Seo
          title={`${error.statusCode}: ${error.message}`}
          description={`${error.message}`}
          ogp={"https://i.imgur.com/l1M6ZDy.jpg"}
          siteDomain={siteDomain}
          twitterId={twitterId}
        />
        <div className="main">
          <div className="content">
            <h1>
              {error.statusCode}: {error.statusLabel}
            </h1>
            <h2>📅 {error.message}</h2>

            {date && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1rem",
                }}
              >
                <a href={`/${yesterday}`}>←{yesterday}</a>
                <a href={`/${tomorrow}`}>{tomorrow}→</a>
              </div>
            )}

            <div style={{ marginTop: "1rem" }}>
              <a href={`https://www.last.fm/user/${lastfmUserId}`}>
                🎧 last.fm/@{lastfmUserId}
              </a>{" "}
              の直近トップトラックから、1日1回ランダムに歌詞をピックアップしています
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    song &&
    siteDomain &&
    twitterId && (
      <>
        <Seo
          title={`${date}: ${song.name} ― ${song.artist}`}
          description={`${date} の曲は ${song.artist} の ${song.name} でした`}
          ogp={song.imageUrl}
          siteDomain={siteDomain}
          twitterId={twitterId}
        />
        <div className="main">
          <div className="content">
            <h1>📅 {date}</h1>
            <div style={{ fontSize: "1.2rem", fontWeight: "500" }}>
              {song.lyrics.join(" ")}
            </div>
            <h2>
              {song.name} ― {song.artist}
            </h2>
            <iframe
              style={{ borderRadius: "12px" }}
              src={`https://open.spotify.com/embed/track/${song?.spotifyId}`}
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen
              clipboard-write="true"
              encrypted-media="true"
              picture-in-picture="true"
              loading="lazy"
            ></iframe>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
              }}
            >
              <a href={`/${yesterday}`}>←{yesterday}</a>
              <a href={`/${tomorrow}`}>{tomorrow}→</a>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <a href={`https://www.last.fm/user/${lastfmUserId}`}>
                🎧 last.fm/@{lastfmUserId}
              </a>{" "}
              の直近トップトラックから、1日1回ランダムに歌詞をピックアップしています
            </div>
          </div>
        </div>
      </>
    )
  );
};

export const Seo: React.FC<{
  title: string;
  description: string;
  ogp: string;
  siteDomain: string;
  twitterId: string;
}> = ({ title, description, ogp, siteDomain, twitterId }) => {
  return (
    <Head>
      <meta name="referrer" content="origin" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta charSet="UTF-8" />
      <meta name="robots" content="noindex,nofollow,noarchive" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700&family=Open+Sans:wght@600;700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/yakuhanjp@3.4.1/dist/css/yakuhanjp.min.css"
      />
      <link rel="stylesheet" type="text/css" href="/assets/index.css" />

      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteDomain} />

      <link rel="preload" as="image" href={ogp}></link>

      <meta property="og:image" content={ogp} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://${siteDomain}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={`@${twitterId}`} />
    </Head>
  );
};

export default DatePage;
