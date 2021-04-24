# Bad evaluations

Looking for Bad evaluations it's a very complex topic, and here we will
explain our ideas and how we are going to implent them.


## Moulinette vs Corrector
We think that a good evaluation should be closer to the one done by the moulinette if
there is any.
So we defined an `interval` with an `upper_bound/lower_bound`, where the middle is the
final grade given by the moulinette.

This hypothesis becomes tricky when the corrector finds a failure too earlier than
the moulinette. In which case, the corrector's grade is lower than the `lower_bound`.
Some solutions we provide:
- We'll give the ability to redefined the boundaries
- We return the comments to let the user decide based on that.
- We plan to use the NPL to check if a good reason is mention in the comments.
- We will base the final decision on the other corrector's grade.


## Corrector vs Correctors
[TODO]

## The duration
(less than 30min and the grade is > 0)
[TODO]

## The Corrector feedbacks
[TODO]

## Slotologie
(check the frequency at which two students correct each other)

- the moulinette grade is lower
- the duration is less than 30 min
- Does not compile
- slotologie
- the evaluated feedback on the evaluator
- empty repository
- forbidden function
- norm error
- author file
- check the feedbacks comments(length, too short, generic or automatic. bad words)
