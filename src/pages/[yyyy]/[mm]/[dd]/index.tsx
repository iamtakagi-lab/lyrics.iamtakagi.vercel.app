import { GetServerSidePropsContext } from "next";
import { Song } from "../../../../common/types";
import { database } from "../../../../common/supabase";
import Head from "next/head";
import "moment/locale/ja";
import moment from "moment";

type Props = {
  date: string;
  lastfmUserId: string;
  song: Song;
  error?: {
    status: number;
    message: string;
  };
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { yyyy, mm, dd } = ctx.query;
  const date = `${yyyy}/${mm}/${dd}`;
  console.log(date);

  /**
   * TODO: date の正規表現チェック
   */

  const { data, error, status } = await database
    .from("songs")
    .select("*")
    .limit(1)
    .eq("date", date);
  if (!data || !data.length || !data[0] || error) {
    return {
      notFound: true,
    };
  }

  console.log(data[0]);
  return {
    props: {
      date,
      lastfmUserId: process.env.LASTFM_USER_ID ?? "iamtakagi",
      song: data[0],
    },
  };
};

export const DatePage = ({ date, lastfmUserId, song }: Props) => {
  const yesterday = moment(date).add(-1, "days").format("YYYY/MM/DD");
  const tomorrow = moment(date).add(1, "days").format("YYYY/MM/DD");

  return (
    song && (
      <>
        {
          /**
           * TODO: OGP を付ける
           */
        }
        <Seo title={`${date} ― ${song.name}`} description={`${date} の曲は ${song.artist} の ${song.name} でした`} ogp={`https://images.weserv.nl/?url=${song.imageUrl}`} />
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
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem'}}>
            <a href={`/${yesterday}`}>
              ←{yesterday}
            </a>
            <a href={`/${tomorrow}`}>
              {tomorrow}→
            </a>
            </div>
            <div style={{marginTop: "1rem"}}>
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
}> = ({ title, description, ogp }) => {
  return (
    <Head>
      <meta name="referrer" content="origin" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta charSet="UTF-8" />
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

      <meta property="og:image" content={ogp} />
      <link rel="preload" as="image" href={ogp}></link>

    </Head>
  );
};

export default DatePage;
