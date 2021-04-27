# Usher

Although the Google Dictionary said it's an "Archaic" noun which means, *an assistant
teacher*. I adapt it to *an assistant for pedagogical purposes at 42*.

## About

With usher tool, you provide a period of time (e.g last week) and it will look for 42
students who have done "bad evaluations" during that time.
As a result, you will have the `evaluation date` and the `logins of participants`.

## Bad evaluations ?
**What's an evaluation ?**  
We define an evaluation as a data object which looks like:
- `{final_mark: number, comment: text}` when it represent the `corrector`'s submission.
- `{rating: number, comment: text}` representing the `corrected`'s submission.

**How it works ?**

With the evaluation object and the criteria below, we group bad corrections
in two main categories(`correction` and `feedback`).
- the moulinette
- the duration
- slotologie
- a moulinette-like bot*(for some projects only)*
- correctors average grade

The evaluation falling in bad `correction` shows that the blame is on the
corrector side. And for the bad `feedback`, it can be on the evaluated,
corrector or both of them.

So we's be looking for *bad correctors* and *bad correcteds* :-D.

For more details about what is a bad evaluation, look [here](concepts.md)

## Latest Features

Here are the latest stuff that the tool is able to do
- retrieve all bad evaluations since the last week

## Environment Setup

The script will need your credentials, you can get them after creating an app [here](https://profile.intra.42.fr/oauth/applications/new).
We assume that any recent version of node and package manager will be enough to move
to the next steps. But we've specified the versions used in development in case of troubles.

**Requirements**
- Node (v15.13.0)
- npm (v7.8.0)
- Your Credentials

## Usage

1. Clone the repository
```sh
git clone https://github.com/Robright20/usher.git
```
2. Change the working directory to `usher` or whatever you named it
```sh
cd usher
```
3. Install dependencies
```sh
npm i
```
4. Save your credentials in a `.env` file
```sh
cat > .env
UID=[your_uid]
SECRET=[your_secret_key]
```
5. Run it !
```sh
npm start
```

## Authors

* **Robert Bright** - [Robright20](https://github.com/Robright20)
