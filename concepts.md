# Bad evaluations

Looking for Bad evaluations it's a very complex topic, and here we will
explain our ideas and how we are going to implent them.

## What's an evaluation ? 
We define an evaluation as a data object which looks like:
- `{final_mark: number, comment: text}` when it represent the `corrector`'s submission(we'll call it `correction`).
- `{rating: number, comment: text}` representing the `corrected`'s
submission(`feedback`).

## How it works ?

We use the evaluation object explained before and the criteria below, to gather
bad evaluatuations in two main categories: `correction` and `feedback`.
- the moulinette
- the duration
- slotologie
- a moulinette-like bot*(for some projects only)*
- correctors average grade
- the comments

The evaluation falling in bad `correction` shows that the blame is on the
corrector side. And for the bad `feedback`, it can be on the evaluated,
corrector or both of them.

The following, explains how we use each attribute of the evaluation object.

**Correction's final_mark:**  
Based to the table below, we assign a label to `final_mark`. This represent
our assumption on the evaluation.  
| 0     | lower_bound | middle | upper_bound | 125    |
|-------|-------------|--------|-------------|--------|
| hater |        |      neutral     |        | family |
|       | enemy  |                  | friend |        |

Notes:  
- `lower_bound` and `upper_bound` will be either a default value or
provided by the user.  
- `middle`: the moulinette, custom moulinette-like bot, correctors average
`final_grade`.  
- `no_errors` (*used later*): means, neither the flags nor the comments shows
there was an error(s).  

After the labeling Phase, we have to verify the related assumption. This is
done by using the criteria mentionned previously.  
Lets illustrate this with the main assumption:  
1. The corrector used a lower grade with no reason(`hater`)  
2. The corrector used an upper grade with no reason(`family`)  

hater:  
- lower grade with `no_errors`. criteria used:
moulinette-like bot, correctors average, duration, comments.  

familly:  
- higher grade `with_errors`. criteria used:
moulinette-like bot, correctors average, duration, comments.  

**Insights that we can get from other evaluation attribute.**   

**feedback_rating:**  
- bad evaluation
- bad correction
- both.

**correction_comment:**  
- error found(flag, explain)
- everything OK
- hate speech
- meaningless

**feedback_comment:**  
- error found(flag, explain)
- everything OK
- hate speech
- meaningless  

**DB Structure**
```

scaleTeam
_id, uid, scale_id, team_id, comment, feedback, final_mark,
flag(details), begin_at, filled_at, corrector, feedback_rating

projectUpload
_id, uid, final_mark, comment

scale
_id, uid, duration, correction_number,

flags
_id, uid, scale_team_id, name, positive

feedbacks
_id, uid, rating, comment, nice, rigorous, interested, ponctual

```
