import { GetServerSidePropsContext } from "next";
import moment from "moment";
import "moment/locale/ja";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  process.env.TZ = "Asia/Tokyo";
  return {
    redirect: {
      permanent: true,
      destination: `/${moment().format("YYYY/MM/DD")}`,
    },
  };
};

export const IndexPage = () => {};

export default IndexPage;
