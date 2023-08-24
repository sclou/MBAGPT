import Layout from '@/components/layout';
import { useState } from 'react';

export default function Upload() {
  const [file, setFile] = useState();
  const [questions, setQuestions] = useState<string[]>([]);
  const [results, setResults] = useState<{ question: string; answer: any }[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const fileReader = new FileReader();
  const handleOnChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const csvFileToArray = (string: string) => {
    const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');
    const array = csvRows.map((i: string) => {
      const q = i.split('\r');
      return q[0].trim();
    });
    setQuestions(array);

    console.log(array);
    return array;
  };

  const Reset = () => {
    setLoading(true);
    setQuestions([]);
    setResults([]);
  };

  const RetrieveResults = () => {
    if (file) {
      fileReader.onload = async function (event: any) {
        const text = event.target.result;
        let arr = csvFileToArray(text);
        await RetrieveAnswers(arr);
      };
      fileReader.readAsText(file);
    }
  };

  const RetrieveAnswers = async (qs: string[]) => {
    if (qs.length > 0) {
      qs.forEach(async (question: string) => {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
          }),
        });
        const data = await response.json();
        if (data.text) {
          setResults((prev) => [
            ...prev,
            { question: question, answer: data.text },
          ]);
        }
      });
    }
    setLoading(false);
  };

  const handleOnSubmit = async (e: any) => {
    e.preventDefault();
    Reset();
    RetrieveResults();
  };

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Upload questions
          </h1>
          <input
            type={'file'}
            id={'csvFileInput'}
            accept={'.csv'}
            onChange={handleOnChange}
          />
          <div className="flex  justify-center items-center"></div>
          <button
            disabled={loading}
            onClick={async (e) => {
              await handleOnSubmit(e);
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Ask AI
          </button>

          {loading ? (
            <div>
              <p>Loading...</p>
            </div>
          ) : (
            <div className="flex flex-col ">
              {results.map(({ question, answer }, i) => {
                return (
                  <div key={i} className="py-5">
                    <div className="flex flex-row">
                      <p className="font-semibold">Question: </p>
                      <p>{question}</p>
                    </div>
                    <div>
                      <p>Answer:</p>
                      <p>{answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
